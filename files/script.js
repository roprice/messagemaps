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
 * SECTION 4 - TBD
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
    interviewName: window.localStorage.getItem('updatedInterviewName') || null,
    interviewId: null,

    // Method to update the interview name from localStorage
    refreshInterviewName() {
      this.interviewName = window.localStorage.getItem('updatedInterviewName');
    }
  });


  Alpine.store('currentPage', {
    current: 'login',
    items: ['signup', 'login']
  });
  Alpine.store('currentScreen', {
    current: localStorage.getItem('currentScreen') || 'maps',
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



// SECTION 1, 2 and 3 - Configuration, Imports, Initialization


// Handle the authentication with Supabase
var SUPABASE_URL = 'https://wogivjshqopegucducyz.supabase.co'
var SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2l2anNocW9wZWd1Y2R1Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0NzU4MzQsImV4cCI6MTk5NDA1MTgzNH0.zj-QBJknPolKZ6TZ_t3r7aPXbhVB1bf9mmoNBBif9OM'
var supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
window.userToken = null



// listen for authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Authentication state changed', event);
  console.log('Current Session', session);
  // Check if the user is logged in
  if (session) {
    Alpine.store('authenticationStatus').current = 'loggedIn';
    // The token is automatically stored by Supabase client, no need to manually store it
  } else {
    Alpine.store('authenticationStatus').current = 'loggedOut';
    // Token is automatically removed by Supabase client when the session ends, no need to manually remove it
  }
});



// Call this function when the page loads
(async function() {
  const session = supabase.auth.session();
  const user = session ? session.user : null;
  if (user) {
    // if the user is already authenticated, load their data
    await getUserData(user.id);
    // load the questions for the interview form
    await getInterviewQuestions();
  }
})();



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


        await getInterviewQuestions();

        const interviewId = await getInterview(userId);
        if (interview !== null && interview !== undefined) {
          console.log('No interview found for user. Redirecting to onboarding...');
          Alpine.store('currentScreen').current = 'maps';
          Alpine.store('onboarding').current = 'welcome';
      } else {
        // Store the interviewId in localStorage immediately after login
        window.localStorage.setItem('interviewData', JSON.stringify(interview));
      }
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
      if (interview !== null && interview !== undefined) {
        console.log('No interview found for user. Redirecting to onboarding...');
        Alpine.store('currentScreen').current = 'maps';
        Alpine.store('onboarding').current = 'welcome';
    } else {
      // Store the interviewId in localStorage immediately after login
      window.localStorage.setItem('interviewData', JSON.stringify(interview));
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


function formatDateTime(dateString = new Date()) {

	const date = new Date(dateString);

	const options = {
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric'
	};
	// console.log("date 1: ", date);
	return date.toLocaleString([], options);

}





// 9.3 Create and manage interviews

// make a new interview
async function createInterview() {

  // Pull the user profile from local storage
  let userProfile = JSON.parse(window.localStorage.getItem('userProfile'));
  //console.log('userProfile called in createInterview():', userProfile)
  const userId = userProfile.user_id;
  
  const foo = JSON.parse(window.localStorage.getItem('userProfile')).user_id
  
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

 async function updateInterview(interviewId, brandName, fullName) {
   try {
     const newInterviewName = `${brandName} discovery interview, ${fullName}`;
     const { data, error } = await supabase
       .from('interviews')
       .update({
         brand_name: brandName,
         interview_name: newInterviewName
       })
       .eq('id', interviewId);

     if (error) {
       console.error('Error updating interview:', error.message);
       return null;
     }

     console.log('Interview updated successfully:', data);

	 window.localStorage.setItem('updatedInterviewName', newInterviewName);
	 
     // Update the Alpine store with the new interview name
     Alpine.store('interviewData').interviewName = newInterviewName;
	 
	 
     // Add highlight class
     document.getElementById('interview-name').classList.add('highlight-welcome');

     // Remove highlight class after a timeout
     setTimeout(() => {
       document.getElementById('interview-name').classList.remove('highlight-welcome');
     }, 2000); // Adjust this value as needed
   

     return data; // Return the updated interview data if needed

   } catch (err) {
     console.error('Exception thrown during interview update:', err.message);
     return null;
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
const autoSave = debounce(

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




	async function getFollowup(questionId, answer, questionText) {
		
	  try {
	    // Prepare the data to send in the body of the POST request
	    const postData = {
	      questionId: questionId,
	      answer: answer,
	      questionText: questionText,
	      
	    };
		console.log("data prepared")


	    const response = await fetch(`/api/followup`, {
	      method: 'POST',
	      headers: {
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify(postData)
	    });

	    if (!response.ok) {
	      throw new Error(`HTTP error! status: ${response.status}`);
	    }

	    const followup_question = await response.json();

	    console.log('Followup question received: ', followup_question);


		// Display the follow-up question in the HTML element
		const followUpContainer = document.getElementById('followup-to-question-id-' + followup_question.questionId);

		// Get the first (and in your case, only) p tag within the followUpContainer
		const followUpParagraph = followUpContainer.querySelector('p');

		// Now, instead of directly setting the textContent of the followUpContainer,
		// you're setting the textContent of the nested p tag.
		followUpParagraph.textContent = followup_question.followupQuestion;
		
		
		// Get the first (and in your case, only) p tag within the followUpContainer
		const followUpTextarea = followUpContainer.querySelector('textarea');
		followUpTextarea.classList.add('show');

		followUpContainer.classList.add('fade-in');

		// After 2 seconds (which is the duration of our fade-in animation), add the highlight class
		setTimeout(() => {
		  followUpParagraph.classList.add('highlight');

		  // Then, after another 2 seconds, remove the highlight class
		  setTimeout(() => {
		    followUpParagraph.classList.remove('highlight');
		  }, 2000);
		}, 2000);


	    return followup_question;
	  } catch (error) {
	    console.error('Error getting followup_question:', error);
	  }
	}



	let followup_questionCalledFlags = {};  // At the start of the script

	// ...

	function handleTextareaInput(event) {
	  // Retrieve userId and interviewId from local storage
	  const userProfile = JSON.parse(window.localStorage.getItem('userProfile'));
	  const interviewData = JSON.parse(window.localStorage.getItem('interviewData'));
	  const userId = userProfile.user_id;
	  const interviewId = interviewData.interviewID;

	  const textarea = event.target;
	  const questionId = event.target.dataset.questionId;
	  const inputValue = textarea.value;

	

	  // Check if we have a flag for this questionId, if not initialize it to false
	  if (followup_questionCalledFlags[questionId] === undefined) {
	    followup_questionCalledFlags[questionId] = false;
	  }

	  if (inputValue.length != undefined) {
	    autoSave(interviewId, questionId, inputValue, userId, textarea);
	  }
	  
	  let interviewQuestions = JSON.parse(window.localStorage.getItem('interviewQuestions'));
	  let currentQuestionId = interviewQuestions.find(q => q.id == questionId);
	  let questionText = currentQuestionId.question_text;

	  if (inputValue.length >= 50 && !followup_questionCalledFlags[questionId] && inputValue[inputValue.length - 1] === ' ') {
	      setTimeout(() => {
	        getFollowup(questionId, inputValue, questionText);

	        followup_questionCalledFlags[questionId] = true;  // Set the flag to true after getFollowup has been called
	      }, 7000);  // 7000 milliseconds = 7 seconds
	    }
	  }




// 9.5 parse interview answers
// Function that attaches the appropriate event handler based on the textarea's ID
function attachEventHandlers(textareaId) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) return;

  // Map of textarea IDs to event handlers
  const eventHandlers = {
    "input-brand_name": handleTextareaBlur,  
    //"competitor_sites": evaluateCompetitors, 
    // ... add as many handlers as you need
  };

  const handler = eventHandlers[textareaId];
  if (handler) {
    textarea.addEventListener('blur', handler);
  }
}

// update intereview with extracted inerview name
function handleTextareaBlur(event) {

  console.log('event.target:', event.target);
  console.log('event.target.value:', event.target.value);

  const characterCount = event.target.value.length;

  if (characterCount >= 2) {
    const interviewDataString = window.localStorage.getItem('interviewData');
    const userProfileString = window.localStorage.getItem('userProfile');
    
    if (interviewDataString && userProfileString) {
      const interviewData = JSON.parse(interviewDataString);
      const userProfile = JSON.parse(userProfileString);
      const interviewId = interviewData.interviewID;
      const fullName = userProfile.full_name;

      console.log("value pass to extractBrandName(): ", event.target.value)
	  
      extractBrandName(event.target.value)
        .then(brandName => {
          console.log('Brand name entered:', brandName);
          return updateInterview(interviewId, brandName, fullName);
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
    const response = await fetch('/api/extract', {
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

  




// SECTION 10 - Event Handlers / Listeners

document.addEventListener('DOMContentLoaded', async (event) => { // 
  
  
  
  // user signs up
  var signUpForm = document.querySelector('#signup');
  signUpForm.onsubmit = signUpSubmitted.bind(signUpForm);

  // user logsin
  var logInForm = document.querySelector('#signin');
  logInForm.onsubmit = logInSubmitted.bind(logInForm);

  // user logs out
  var logoutButtons = document.querySelectorAll('.logout-button');
  logoutButtons.forEach(function (logoutButton) {
    logoutButton.onclick = logoutSubmitted.bind(logoutButton);
  });



  document.querySelectorAll('textarea').forEach((textarea) => {
	  
    textarea.addEventListener('blur', function() {
		log.console('blurred off text area');
      if (this.value.trim() === '') {
        const questionLabel = this.id.replace('input-', '');
        const correspondingLi = document.getElementById('question-' + questionLabel);
        if (correspondingLi) {
          correspondingLi.classList.remove('completed');
        }
      }
    });
  });

  document.querySelectorAll('textarea').forEach((textarea) => {
    textarea.addEventListener('input', function() {
      const questionLabel = this.id.replace('input-', '');
      const correspondingLi = document.getElementById('question-' + questionLabel);
    
      if (this.value.trim() === '') {
        if (correspondingLi) {
          correspondingLi.classList.remove('completed');
        }
      } else {
        if (correspondingLi && !correspondingLi.classList.contains('completed')) {
          correspondingLi.classList.add('completed');
        }
      }
    });
  });



  function expandTextarea(textarea) {
      // Reset textarea height if text was deleted
      textarea.style.height = 'auto';

      // Get and set the scroll height to the textarea height
      // This will make the textarea wrap all the text it contains
      textarea.style.height = `${textarea.scrollHeight}px`;
  }
  
  //## MUTATION OBSERVER
  // Select the node that will be observed for mutations
  var targetNode = document.getElementById('Interview');

  // Options for the observer (which mutations to observe)
  var config = { attributes: false, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  // Callback function to execute when mutations are observed
  var callback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('Child list has changed');
        // New nodes added or removed
        let textareas = targetNode.querySelectorAll('textarea');
        textareas.forEach(textarea => {
          // add keyup event listener to each textarea
          textarea.addEventListener('keyup', function() {
            expandTextarea(this);
          });

          // add blur event listener to each textarea
          textarea.addEventListener('blur', function() {
            const questionId = this.id.replace('input-', '');
            const correspondingLi = document.getElementById('question-' + questionId);
            if (this.value.trim() === '') {
              if (correspondingLi) {
                correspondingLi.classList.remove('completed');
                console.log(`Removing 'completed' class from question-${questionId}`);
              }
            } else {
              if (correspondingLi) {
                correspondingLi.classList.add('completed');
                console.log(`Adding 'completed' class to question-${questionId}`);
              }
            }
          });
        });
      }
    }
  };

  // Create an observer instance linked to the callback function
  var observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
  //## /MUSTATION OBSERVER


  // user edits and blurs (leaves) brand name textarea
	// Get the textarea element using its ID
 	const textarea = document.getElementById("input-brand_name");

  	// Check if the textarea exists before attaching an event listener
  	if (textarea) {
    	// Add an event listener to the textarea
    	textarea.addEventListener('blur', handleTextareaBlur);
  	}


  //create interview clicked
  const interviewButton = document.getElementById('InterviewMe');
  interviewButton.addEventListener('click', async () => {
    // Pull the user profile from local storage
    const userProfile = JSON.parse(window.localStorage.getItem('userProfile'));
    console.log('userProfile when called by eventlistener for #InterviewMe:', userProfile);

    // Extract the user's ID and full name from the profile
    const userId = userProfile.user_id;
    console.log('userID value when called by eventlistener for #InterviewMe:', userProfile.user_id);

    // load CreateInterview
    await createInterview();

  });

  // delete interview clicked
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
