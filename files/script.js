/*
 * TABLE OF CONTENTS:
 *
 * SECTION 1 - Configuration
 *   - API endpoints, authentication credentials, environment variables, etc.
 *
 * SECTION 2 - Imports
 *   - External libraries, modules, third-party libraries, etc.
 *
 * SECTION 3 - Reload/Initialization
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
 *      9.1 - Miscellaneous component logic
 *
 *
 *      9.2 - Build Interview Form
 *       - Load the interview questions
 *       - Build the interview form
 *
 *      9.3 Create and manage interviews
 *       - Create a new interview
 *       - Update an existing interview
 *       - Delete an interview
 *       - Load an existing interview
 *
 *      9.4 - Autoave interview answers
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

// curl -L -X POST 'https://wogivjshqopegucducyz.functions.supabase.co/llm' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2l2anNocW9wZWd1Y2R1Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0NzU4MzQsImV4cCI6MTk5NDA1MTgzNH0.zj-QBJknPolKZ6TZ_t3r7aPXbhVB1bf9mmoNBBif9OM' --data '{"name":"Functions"}'


// SECTION 1 - Configuration


// Handle the authentication with Supabase
var SUPABASE_URL = 'https://wogivjshqopegucducyz.supabase.co'
var SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2l2anNocW9wZWd1Y2R1Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0NzU4MzQsImV4cCI6MTk5NDA1MTgzNH0.zj-QBJknPolKZ6TZ_t3r7aPXbhVB1bf9mmoNBBif9OM'
var supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
window.userToken = null


function setToken(response) {
  if (!response || !response.session || !response.session.access_token) {
    console.log('No access token in the response');
  } else {
    localStorage.setItem('supabase.auth.token', response.session.access_token); // store the token in local storage
    console.log('Access Token:', response.session.access_token);
    Alpine.store('authenticationStatus').updateAuthStatus(); // update the authentication status
    console.log('Access Token:', response.session.access_token);
    console.log('Refresh Token:', response.session.refresh_token);
    console.log('Logged in as', response.user.email);

  }
}


function setTokenOnReload(user) {
  localStorage.setItem('supabase.auth.token', user.access_token);
  Alpine.store('authenticationStatus').updateAuthStatus();
}



// SECTION 2 - Imports




// SECTION 3 - Reload/Initialization

// Call this function when the page loads

(async function() {

  const user = supabase.auth.user();

  if (user) {

    // if the user is already authenticated, load their data
    await getUserData(user.id);

    // load the questions for the interview form
    await getInterviewQuestions();

    // Set the token from the response
    setTokenOnReload(user);

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
    fullName: '',
    interviewName: '',
  });

  Alpine.store('interviewData', {
    createdDate: null,
    updatedDate: null,
    interviewName: null,
    interviewId: null,
  });

  Alpine.store('currentPage', {
    current: 'login',
    items: ['signup', 'login']
  });
  Alpine.store('currentScreen', {
    current: localStorage.getItem('currentScreen') || 'dashboard',
    items: ['account','dashboard','maps','interviews','strategies','assets','newMap'],
  });
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

        const userProfile = data[0];

        if (userProfile) {
          // Save the userProfile data in local storage or in a state
          window.localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }


        console.log('userProfile stored to local storage:', userProfile);
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

      const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)

      if (data && data.length > 0) {
        const userProfile = data[0];

        // Save the object, not the array
        window.localStorage.setItem('userProfile', JSON.stringify(userProfile));
      }

      await getInterviewQuestions();

      const interviewId = await getInterview(userId);
      if (interviewId === null) {
        console.log('No interview found for user. Redirecting to onboarding...');
        Alpine.store('currentScreen').current = 'dashboard';
        Alpine.store('onboarding').current = 'welcome';
      } else {
        //
      }

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
      localStorage.clear();
      Alpine.store('authenticationStatus').updateAuthStatus();
    })
    .catch((err) => {
      console.log('signOut error', err)
      alert(err.response.text)
    })
}



// SECTION 9 - Component Logic

//  9.1 - Miscellaneous component logic
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


//  9.2 - Build Interview Form
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


// 9.25 get the answers with which to populate the interview form

async function fetchAnswers(interviewId, userId) {
  try {
    const { data, error } = await supabase
      .from('interview_answers')
      .select('question_id, answer')
      .eq('interview_id', interviewId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    } else {
      console.log('Fetched answers:', data);
      return data;  // Return the fetched answers
    }
  } catch (error) {
    console.error('Error fetching answers:', error);
  }
}



// 9.3 Create and manage interviews

// make a new interview
async function createInterview() {

  // Pull the user profile from local storage
  let userProfile = JSON.parse(window.localStorage.getItem('userProfile'));
  //console.log('userProfile called in createInterview():', userProfile)
  const userId = userProfile.user_id;
  //console.log('userId called in createInterview():', userId);

  // First, check if the user already has an interview
  const existingInterviewId = await getInterview(userId);
  if (existingInterviewId !== null) {
    console.log('User already has an interview. No new interview created.');
    return null;
  }

  // Second, create the interview if the user does not already have one
  const fullName = userProfile.full_name
  const interviewName = `${fullName} interview`;

  const { data, error } = await supabase
  .from('interviews')
  .insert({
    user_id: userId,
    interview_name: interviewName // This is the name of the interview
  });

  if (error) {
    console.error('Error creating interview:', error);
  } else {
    console.log('Interview created successfully:', data);
    // If interview creation was successful, update the userData store with the interview name

  }
 }


// edit an interview (by adding brand name)

async function updateInterview(interviewId, brandName) {
  try {
    const { data, error } = await supabase
      .from('interviews')
      .update({ brand_name: brandName })
      .eq('id', interviewId);

    if (error) {
      console.error('Error updating interview:', error.message);
      return null;
    }

    console.log('Interview updated successfully:', data);

    return data; // Return the updated interview data if needed

  } catch (err) {
    console.error('Exception thrown during interview update:', err.message);
    return null;
  }
}

// update intereview with extracted inerview name
function handleTextareaBlur(event) {


  console.log('event.target:', event.target);
  console.log('event.target.value:', event.target.value);

  const characterCount = event.target.value.length;

  if (characterCount >= 2) {
    const interviewDataString = window.localStorage.getItem('interviewData');
    if (interviewDataString) {
      const interviewData = JSON.parse(interviewDataString);
      const interviewId = interviewData.interviewID;

      console.log("value pass to extractBrandName(): ", event.target.value)
      extractBrandName(event.target.value)
        .then(brandName => {
          console.log('Brand name entered:', brandName);
          return updateInterview(interviewId, brandName);
        })
        .then(() => {
          console.log('Interview updated successfully!');
        })
        .catch((error) => {
          console.error('Error updating interview:', error);
        });
    }
  }
}
async function extractBrandName(text) {
  console.log('extractBrandName called with:', text);

  try {
    const response = await fetch('/app/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse response as JSON
    console.log("Extracted brand name: ", data); // show extracted brand name
    return data.brandName; // Return the brand name from the response
  } catch (error) {
    console.log("An error occurred:", error);
  }
}




// delete interview
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

// get the users interview to review, edit, etc
async function getInterview(userId) {
  //console.log('User ID called in GetInterview(userId):', userId);
  try {

    // Check if an interview exists for the user
    const { data: countData, error: countError, count } = await supabase
      .from('interviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);


    if (countError) {
      console.error('Error counting interviews:', countError.message);
      return null;
    }

    const interviewCount = parseInt(count);



    // If no interview exists, return null immediately
    if (interviewCount === 0) {
      console.warn('No interview found for this user.');
      return null;
    }


    // If an interview does exist, proceed with fetching it
    const { data: interview, error } = await supabase
      .from('interviews')
      .select('id, created_at, updated_at, interview_name')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .single();

    if (error) {
      console.error('Error fetching interview:', error.message);
      return null;
    }


    // Store interview data to Alpine store
    Alpine.store('interviewData').interviewName = interview.interview_name;
    Alpine.store('interviewData').createdDate = interview.created_at;
    Alpine.store('interviewData').updatedDate = interview.updated_at;
    Alpine.store('interviewData').interviewID = interview.id;

    // Create a new JavaScript object
    const interviewData = {
      interviewName: interview.interview_name,
      createdDate: interview.created_at,
      updatedDate: interview.updated_at,
      interviewID: interview.id
    };

    // Convert the object to a JSON string
    const interviewDataString = JSON.stringify(interviewData);

    // Store the string in localStorage
    window.localStorage.setItem('interviewData', interviewDataString);

    console.log('Interview data:', interview);

    // Return the ID of the existing interview
    return interview.id;

  } catch (err) {
    console.error('Exception thrown during interview fetch:', err.message);
    return null;
  }
}


//  9.4 - autoave interview answers
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
      .upsert({
        interview_id: interviewId,
        question_id: questionId,
        answer: answer,
        user_id: userId,
      },{
        onConflict: ['interview_id', 'question_id', 'user_id']
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


const debouncedSave = debounce(

  async function (interviewId, questionId, answer, userId, textarea) {
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

function handleTextareaInput(event) {

  // Retrieve userId and interviewId from local storage
  const userProfile = JSON.parse(window.localStorage.getItem('userProfile'));
  const interviewData = JSON.parse(window.localStorage.getItem('interviewData'));
  const userId = userProfile.user_id;
  const interviewId = interviewData.interviewID;


  const textarea = event.target;
  const questionId = event.target.dataset.questionId;
  const inputValue = textarea.value;


  if (inputValue.length >= 5) {
    debouncedSave(interviewId, questionId, inputValue, userId, textarea);
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
    const userId = userProfile.user_id;
    console.log('userID value when called by eventlistener for #InterviewMe:', userProfile.user_id);


    // Create the interview
    await createInterview();

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




// SECTION 11 - Helper Functions

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // Helper function to delay the execution of an async function

function capitalizeWords(str) {
  return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
