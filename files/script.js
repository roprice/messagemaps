// Handle the authentication with Supabase
var SUPABASE_URL = 'https://wogivjshqopegucducyz.supabase.co'
var SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2l2anNocW9wZWd1Y2R1Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0NzU4MzQsImV4cCI6MTk5NDA1MTgzNH0.zj-QBJknPolKZ6TZ_t3r7aPXbhVB1bf9mmoNBBif9OM'
var supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
window.userToken = null



const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Wait for the page to load and then attach the event handlers
document.addEventListener('DOMContentLoaded', function (event) {
  var signUpForm = document.querySelector('#signup')
  signUpForm.onsubmit = signUpSubmitted.bind(signUpForm)

  var logInForm = document.querySelector('#signin')
  logInForm.onsubmit = logInSubmitted.bind(logInForm)

  var logoutButtons = document.querySelectorAll('.logout-button')
  logoutButtons.forEach(function (logoutButton) {
    logoutButton.onclick = logoutSubmitted.bind(logoutButton)
  })
})


// Sign the user up
const signUpSubmitted = async (event) => {
  event.preventDefault();
  Alpine.store('formStatus').disableSubmitButton();
  const fullName = event.target[0].value; // Get the full name from the form
  const email = event.target[1].value; // Get the email address from the form
  const password = event.target[2].value;

  try {
    const response = await supabase.auth.signUp({ email, password });
    console.log('Signup response:', response);

    if (response.error) {
      Alpine.store('formStatus').showErrorMessage(response.error.message);
    } else {
      setToken(response);
      Alpine.store('formStatus').showSuccessMessage('Success!');
      await delay(1000);
      Alpine.store('formStatus').showSuccessMessage('Success! Accounted Created.');
      await delay(800);
      Alpine.store('formStatus').showSuccessMessage('Success! Accounted Created. Logging you in now..');
      await delay(500);
      Alpine.store('authenticationStatus').current = 'loggedIn';

      // Get the current user's ID
      const userId = response.user.id;

      // Create a new profile entry in the 'user_profiles' table
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(
          {
            user_id: userId,
            inferred_first_name: firstName, // Set the first name from the form
            // Set default values for the other profile fields (e.g., empty strings)
          }
        );

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        await getUserData(userId);
        console.log('About to create messagemap and interview for user with ID: ', userId);
        const messageMap = await createMessageMap(userId, firstName); // Get the created message map
        const messageMapId = messageMap.id; // Get the message_map_id from the created message map
        await createInterview(userId, firstName, messageMapId); // Pass the messageMapId to the createInterview function

      }
    }
  } catch (err) {
    Alpine.store('formStatus').showErrorMessage(err.message);
  } finally {
    Alpine.store('formStatus').enableSubmitButton();
  }
};

// Modify the createMessageMap function
async function createMessageMap(userId, firstName) {
  const { data, error } = await supabase
  .from('message_maps')
  .insert({
    user_id: userId,
    map_name: `${firstName}'s map`, // Use the firstName passed as an argument
    // Add any other default interview data here if needed
  });

  if (error) {
    console.error('Error creating the message map:', error);
    return null; // Return null if there's an error
  } else {
    console.log('message map created successfully:', data);
    return data[0]; // Return the created message map
  }
}


async function createInterview(userId, firstName) {
  const { data, error } = await supabase
  .from('interviews')
  .insert({
    user_id: userId,
    interviewee_name: firstName, // Use the firstName passed as an argument
    // Add any other default interview data here if needed
  });

  if (error) {
    console.error('Error creating interview:', error);
  } else {
    console.log('Interview created successfully:', data);
  }
}




// Log the user in
const logInSubmitted = async (event) => {
  event.preventDefault();
  Alpine.store('formStatus').disableSubmitButton();
  const email = event.target[0].value;
  const password = event.target[1].value;
  try {
    const response = await supabase.auth.signIn({ email, password });
    console.log('Signup response:', response);
    if (response.error) {
      Alpine.store('formStatus').showErrorMessage(response.error.message);
    } else {
      Alpine.store('formStatus').showSuccessMessage('Success!');
      await delay(800);
      Alpine.store('formStatus').showSuccessMessage('Success! Loading...');
      await delay(500);
      setToken(response);
      getInterviewQuestions();
      Alpine.store('authenticationStatus').current = 'loggedIn';
      console.log('signin successful');
      await getUserData(userId);
    }
  } catch (err) {
    Alpine.store('formStatus').showErrorMessage(err.message);
  } finally {
    Alpine.store('formStatus').enableSubmitButton();
  }
};


async function getUserData(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('inferred_first_name, role')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
  } else {
    // Update the Alpine store with the fetched data
    Alpine.store('userData').firstName = data.inferred_first_name;
    Alpine.store('userData').role = data.role;
  }
}







function setToken(response) {
  if (response.user.confirmation_sent_at) {
    if (!response || !response.session || !response.session.access_token) {
      console.log('Confirmation Email Sent');
    } else {
      console.log('sT Access Token:', response.session.access_token);
      console.log('Refresh Token:', response.session.refresh_token);
      console.log('Logged in as', response.user.email);
      Alpine.store('authenticationStatus').updateAuthStatus();
    }
  }
}


//


async function getInterviewQuestions() {
  try {
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*');
    if (error) {
      throw error; // Throw the error to be caught by the catch block
    }
    localStorage.setItem('interviewQuestions', JSON.stringify(data)); // Store the interview questions in the local storage
    Alpine.store('questions', data); // Update the Alpine store with the interview questions
  } catch (err) {
    console.error('Error fetching interview questions:', err);
  }
}



// Log the user out
const logoutSubmitted = (event) => {
  console.log('logoutSubmitted called')
  event.preventDefault()
  supabase.auth
    .signOut()
    .then((_response) => {
      console.log('logout successful')
      Alpine.store('authenticationStatus').updateAuthStatus();
    })
    .catch((err) => {
      console.log('signOut error', err)
      alert(err.response.text)
    })
}


// Call this function when the page loads
(async function() {
  const user = supabase.auth.user();
  if (user) {
    // if the user is already authenticated, load their data
    await getUserData(user.id);

    // Call the getInterviewQuestions function directly
    await getInterviewQuestions();
  }
})();


// Alpine.js state management
document.addEventListener('alpine:init', function() {

    Alpine.store('authenticationStatus', {
      current: 'loggedOut',
      items: ['loggedIn', 'loggedOut'],
      updateAuthStatus: function () {
        console.log('updateAuthStatus called');
        if (localStorage.getItem('supabase.auth.token')) {
          this.current = 'loggedIn';

        } else {
          this.current = 'loggedOut';
        }
      },
    });


    if (localStorage.getItem('supabase.auth.token')) {
      Alpine.store('authenticationStatus').current = 'loggedIn';
    }




    Alpine.store('errorMessage', { message: '' }); // initialize the errorMessage global state

    Alpine.store('showSuccessMessage', false); // initialize the errorMessage global state

    Alpine.store('formStatus', {
      submitButtonDisabled: false,
      successMessage: '',
      errorMessage: '',
      disableSubmitButton() {
        this.submitButtonDisabled = true;
      },
      enableSubmitButton() {
        this.submitButtonDisabled = false;
      },
      showSuccessMessage(message) {
        this.successMessage = message;
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      },
      showErrorMessage(message) {
        this.errorMessage = message;
        setTimeout(() => {
          this.errorMessage = '';
        }, 2000);
      }
    });

  // Create a new Alpine store
  Alpine.store('userData', {
    firstName: '',
  });


  // site-level states
  Alpine.store('currentPage', {
    current: 'login',
    items: ['signup', 'login']
  });
  // app-level states
  Alpine.store('currentScreen', {
    current: 'dashboard',
    items: ['account','dashboard','maps','interviews','strategies','assets','newMap']
  });
  // app-level states
  Alpine.store('onboarding', {
    current: 'welcome',
    items: ['welcome','hiddenwelcome']
  });
  Alpine.store('lightDarkMode', {
    current: 'light',
    items: ['light','dark']
  });

  Alpine.store('sidebarStatus', {
    current: localStorage.getItem('sidebarStatus') || 'expanded',
    items: ['collapsed', 'expanded'],
    toggle() {
      this.current = this.current === 'collapsed' ? 'expanded' : 'collapsed';
      localStorage.setItem('sidebarStatus', this.current);
    }
  });

});

function handleError(error) {
  console.error(error);
  // Handle the error as needed (e.g. display an error message to the user)
}

function bodyClasses() {
  return [
    Alpine.store('userData').firstName,
    Alpine.store('authenticationStatus').current,
    Alpine.store('currentPage').current,
    Alpine.store('currentScreen').current,
    Alpine.store('lightDarkMode').current,
    Alpine.store('sidebarStatus').current,
    Alpine.store('onboarding').current,
  ].join(' ');
}