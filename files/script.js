/*
 * TABLE OF CONTENTS:
 *
 * SECTION 1 - Configuration
 *   - API endpoints, authentication credentials, environment variables, etc.
 *
 * SECTION 2 - Imports
 *   - External libraries, modules, third-party libraries, etc.
 *
 * SECTION 3 - Initialization
 *   - Initial setup, state initialization, event listeners, service workers, etc.
 *   - Handle page reload events and their implications on the app.
 *
 * SECTION 4 - Authentication to Supabase
 *   - Handle the authentication with Supabase
 *
 * SECTION 5 - State Management
 *   - Manage the state of the app, data storage and retrieval, UI updates, etc.
 *
 * SECTION 6 - Signup
 *   - Signup functionality.
 *
 * SECTION 7 - Login
 *   - Login functionality.
 *
 * SECTION 8 - Logout
 *   - Logout functionality.
 *
 * SECTION 9 - Component Logic
 *   - Define the behavior of your app's components, render templates, handle component-specific events, etc.
 *
 * SECTION 10 - Event Handlers
 *   - User interactions like button clicks, form submissions, keyboard events, etc.
 *
 * SECTION 11 - Helper Functions
 *   - Helper and utility functions, formatting, validation, async operations, etc.
 *
 * SECTION 12 - Error Handling
 *   - Handle errors and exceptions, network errors, user input errors, server errors, etc.
 *
 * SECTION 13 - Testing
 *   - Code related to testing the app, unit tests, integration tests, end-to-end tests, etc.
 *
 * SECTION 14 - Deployment
 *   - Code related to deploying your app, building and packaging, server configuration, hosting service deployment, etc.
 */




// SECTION 1 - Configuration


// Handle the authentication with Supabase
var SUPABASE_URL = 'https://wogivjshqopegucducyz.supabase.co'
var SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2l2anNocW9wZWd1Y2R1Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0NzU4MzQsImV4cCI6MTk5NDA1MTgzNH0.zj-QBJknPolKZ6TZ_t3r7aPXbhVB1bf9mmoNBBif9OM'
var supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
window.userToken = null


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



// SECTION 2 - Imports




// SECTION 3 - Initialization

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



// SECTION 4 - Authentication to Supabase




// SECTION 5 - State Management







// Alpine.js state management
document.addEventListener('alpine:init', function() {
  console.log('Alpine.js has been initialized');
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

  Alpine.store('userData', {
    firstName: '',
  });

  Alpine.store('interviewData', {
    createdDate: null,
    updatedDate: null,
  });

  Alpine.store('currentPage', {
    current: 'login',
    items: ['signup', 'login']
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


  Alpine.store('currentScreen', {
    current: localStorage.getItem('currentScreen') || 'dashboard',
    items: ['account','dashboard','maps','interviews','strategies','assets','newMap'],
});



});




// update state with user info
async function getUserData(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('first_name')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
  } else {
    // Update the Alpine store with the fetched data
    Alpine.store('userData').firstName = data.first_name;

  }
}














// SECTION 6 - Signup

const signUpSubmitted = async (event) => {
  event.preventDefault();
  Alpine.store('formStatus').disableSubmitButton();
  const fullName = event.target[0].value; // Get the full name from the form
  const [firstName, lastName] = fullName.split(' '); // Get the first and last name
  const email = event.target[1].value; // Get the email address from the form
  const password = event.target[2].value;

  try {
    const response = await supabase.auth.signUp({ email, password });
    console.log('Signup response:', response);

    if (response.error) {
      Alpine.store('formStatus').showErrorMessage(response.error.message);
    } else {
      setToken(response);
      Alpine.store('formStatus').showSuccessMessage('Success!'); await delay(1000);
      Alpine.store('formStatus').showSuccessMessage('Success! Accounted Created.'); await delay(800);
      Alpine.store('formStatus').showSuccessMessage('Success! Accounted Created. Logging you in now..'); await delay(500);
      Alpine.store('authenticationStatus').current = 'loggedIn';

      // Get the current user's ID
      const userId = response.user.id;

      // Create a new profile entry in the 'user_profiles' table
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(
          {
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
          }
        );

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        window.localStorage.setItem('userProfile', JSON.stringify(data));
        console.log('Profile stored successfully:', data);
      }
    }
  } catch (err) {
    Alpine.store('formStatus').showErrorMessage(err.message);
  } finally {
    Alpine.store('formStatus').enableSubmitButton();
  }
};




// SECTION 7 - Login

// Log the user in
const logInSubmitted = async (event) => {
  event.preventDefault();
  Alpine.store('formStatus').disableSubmitButton();
  const email = event.target[0].value;
  const password = event.target[1].value;
  try {
    const response = await supabase.auth.signIn({ email, password });
    console.log('Signin response:', response);
    if (response.error) {
      Alpine.store('formStatus').showErrorMessage(response.error.message);
    } else {
      Alpine.store('formStatus').showSuccessMessage('Success!');
      await delay(800);
      Alpine.store('formStatus').showSuccessMessage('Success! Loading...');
      await delay(500);
      setToken(response);

      Alpine.store('authenticationStatus').current = 'loggedIn';
      console.log('Signin successful');
      // Get user profile after successful login

      const userId = response.user.id;

      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userProfile) {
        // Save the userProfile data in local storage or in a state
        window.localStorage.setItem('userProfile', JSON.stringify(userProfile));
      }

      await getInterview(userId);


      getInterviewQuestions();
    }
  } catch (err) {
    Alpine.store('formStatus').showErrorMessage(err.message);
  } finally {
    Alpine.store('formStatus').enableSubmitButton();
  }
};




// SECTION 8 - Logout


// Log the user out - state becomes "logged out"
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



// SECTION 9 - Component Logic



// assign body classes

function bodyClasses() {
  return [

    Alpine.store('authenticationStatus').current,
    Alpine.store('userData').firstName,
    Alpine.store('currentPage').current,
    Alpine.store('currentScreen').current,
    Alpine.store('lightDarkMode').current,
    Alpine.store('sidebarStatus').current,
    Alpine.store('onboarding').current,

  ].join(' ');
}



// create webform component

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
    console.log('Stored questions:', Alpine.store('questions')); // Debugging: Check the stored questions

  } catch (err) {
    console.error('Error fetching interview questions:', err);
  }
}




// deal with interview object

async function createInterview(userId) {
  const { data, error } = await supabase
  .from('interviews')
  .insert({
    user_id: userId,
  });

  if (error) {
    console.error('Error creating interview:', error);
  } else {
    console.log('Interview created successfully:', data);
  }
}


async function getInterview(userId) {
  console.log('getInterview called');
  console.log('User ID called in GetInterview(userID):', userId);
  try {
    const { data: interview, error } = await supabase
      .from('interviews')
      .select('id, created_at, updated_at') // Include the 'id' field in the select statement
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching interview:', error.message);
      return null;
    }

    if (interview) {
      console.log('Interview data:', interview);
      Alpine.store('interviewData').createdDate = interview.created_at;
      Alpine.store('interviewData').updatedDate = interview.updated_at;
      Alpine.store('interviewData').interviewID = interview.id;

      return interview.id; // Return the interview ID
    } else {
      console.warn('No interview found for this user.');
      return null;
    }
  } catch (err) {
    console.error('Exception thrown during interview fetch:', err.message);
    return null;
  }
}



async function deleteInterview(interviewId) {
  const { data, error } = await supabase
    .from('interviews')
    .delete()
    .eq('id', interviewId);

  if (error) {
    console.error('Error deleting interview:', error);
  } else {
    console.log('Interview deleted successfully:', data);
  }
}












// SECTION 10 - Event Handlers / Listeners


document.addEventListener('DOMContentLoaded', async (event) => {
  var signUpForm = document.querySelector('#signup');
  signUpForm.onsubmit = signUpSubmitted.bind(signUpForm);

  var logInForm = document.querySelector('#signin');
  logInForm.onsubmit = logInSubmitted.bind(logInForm);

  var logoutButtons = document.querySelectorAll('.logout-button');
  logoutButtons.forEach(function (logoutButton) {
    logoutButton.onclick = logoutSubmitted.bind(logoutButton);
  });

  const interviewButton = document.getElementById('InterviewMe');
  interviewButton.addEventListener('click', async () => {
    // Pull the user profile from local storage
    const userProfile = JSON.parse(window.localStorage.getItem('userProfile'));
    console.log('userProfile when called by eventlistener for #InterviewMe:', userProfile);

    // Extract the user's ID and full name from the profile
    const userId = userProfile[0].user_id;
    console.log('userID value when called by eventlistener for #InterviewMe:', userId);

    // Create the interview
    await createInterview(userId);
    await getInterview(userId);
  });

  const deleteButton = document.getElementById('DeleteInterview');
  deleteButton.addEventListener('click', async () => {
    // Pull the user profile from local storage
    const userProfile = JSON.parse(window.localStorage.getItem('userProfile'));

    // Extract the user's ID from the profile
    const userId = userProfile.user_id;

    // Fetch the most recent interview
    const interviewId = await getInterview(userId);

    // Delete the interview
    if (interviewId) {
      await deleteInterview(interviewId);
    } else {
      console.log('No interview found to delete.');
    }
  });
});

window.addEventListener('load', (event) => {

  // Get all elements with the class 'work-on-interview'
  var buttons = document.querySelectorAll('.work-on-interview');

  for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function(event) {

        console.log('Button clicked');  // debugging line

          // Prevent the default action
          event.preventDefault();

          Alpine.store('currentScreen').current = 'interviews';
          localStorage.setItem('currentScreen', 'interviews');

          // Confirm the state update
          console.log('currentScreen state updated to:', Alpine.store('currentScreen').current);
      });
  }
});



// SECTION 11 - Helper Functions





// SECTION 12 - Error Handling




function handleError(error) {
  console.error(error);
}


// SECTION 13 - Testing





// SECTION 14 - Deployment






function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}



async function saveAnswer(interviewId, questionId, answer, userId) {
  if (!interviewId) {
    throw new Error('Invalid interviewId');
  }
  try {
    const { data, error } = await supabase
      .from('interview_answers')
      .insert({
        interview_id: interviewId,
        question_id: questionId,
        answer: answer,
        user_id: userId,
      });

    if (error) {
      throw error;
    } else {
      console.log('Answer saved successfully:', data);
    }
  } catch (error) {
    console.error('Error saving answer:', error);
  }
}

const debouncedSave = debounce(async function (interviewId, questionId, answer, userId, textarea) {
  try {
    await saveAnswer(interviewId, questionId, answer, userId);

    // Show the snackbar notification
    const snackbar = document.getElementById("snackbar");
    snackbar.className = "snackbar show";
    setTimeout(() => {
      snackbar.className = "snackbar";
    }, 3000);

    // Change the background color of the textarea
    textarea.classList.add("autosaveIndicator");
    setTimeout(() => {
      textarea.classList.remove("autosaveIndicator");
    }, 2000);
  } catch (error) {
    console.error('Error saving answer:', error);
  }
}, 2000);

function handleTextareaInput(event, interviewId, userId) {
  const textarea = event.target;
  const questionId = event.target.dataset.questionId;
  const inputValue = textarea.value;


  if (inputValue.length >= 5) {
    debouncedSave(interviewId, questionId, inputValue, userId, textarea);
  }
}








// SECTION 11 - Helper Functions

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // Helper function to delay the execution of an async function