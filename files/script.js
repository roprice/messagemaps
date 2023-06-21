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
        //console.log('updateAuthStatus called');
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


	// Define the Alpine store
	Alpine.store('questions', {
	    data: [],
	    isDataLoaded: false
	});


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



	Alpine.store('yourBrand', {
		brandName: 'your brand', // default value
		setBrandName(value) {
			this.brandName = value;
		},
	})

	Alpine.store('currentScreen', new Proxy({
	  current: localStorage.getItem('currentScreen') || 'maps',
	  items: [
	    ['account', 'your account'],
	    ['settings', 'settings'],
	    ['maps', localStorage.getItem('interviewData') ? `${JSON.parse(localStorage.getItem('interviewData')).brandName} message map` : 'your message map'],
	    ['interviews', 'discovery interview'],
	    ['interview-review', 'discovery interview report'],
	    ['strategies', 'business strategy'],
	    ['strategy-review', 'business strategy report'],
	    ['assets', 'sales and marketing assets'],
	    ['newMap', 'get a new map'],
	  ],
	  showName: function () {
	    let item = this.items.find(item => item[0] === this.current);
	    return item ? item[1] : this.current; // if not found, return the slug itself
	  }
	}, {
	  set: function(target, property, value) {
	    if (property === 'current') {
	      // Whenever 'current' property is set, also save it to local storage
	      localStorage.setItem('currentScreen', value);
	    }
	    // Set the value on the original object
	    target[property] = value;
	    // Indicate successful setting
	    return true;
	  }
	}));

	let initialUserProfileData = window.localStorage.getItem('userProfile');
	if (initialUserProfileData) {
	  initialUserProfileData = JSON.parse(initialUserProfileData);
	} else {
	  initialUserProfileData = {
	    user_id: null,
	    first_name: null,
	    last_name: null,
	    full_name: null,
	    company: null,
	    role: null,
	    account_tier: null,
	  };
	}

	Alpine.store('userProfile', {
	  data: new Proxy(initialUserProfileData, {
	    set: function(target, property, value) {
	      // Set the value on the original object
	      target[property] = value;
	      // Save to localStorage whenever any property is updated
	      window.localStorage.setItem('userProfile', JSON.stringify(target));
	      // Indicate successful setting
	      return true;
	    },
	  }),
	  getInitials: function () {
	    let firstNameInitial = this.data.first_name ? this.data.first_name[0].toUpperCase() : '';
	    let lastNameInitial = this.data.last_name ? this.data.last_name[0].toUpperCase() : '';
	    return firstNameInitial + ' ' + lastNameInitial;
	  },
	});


	let initialInterviewData = window.localStorage.getItem('interviewData');
	if (initialInterviewData) {
	  initialInterviewData = JSON.parse(initialInterviewData);
	} else {
	  initialInterviewData = {
	    createdDate: null,
	    updatedDate: null,
	    interviewName: null,
	    interviewId: null,
	  };
	}

	Alpine.store('interviewData', new Proxy(initialInterviewData, {
	  set: function(target, property, value) {
	    // Set the value on the original object
	    target[property] = value;
	    // Save to localStorage whenever any property is updated
	    window.localStorage.setItem('interviewData', JSON.stringify(target));
	    // Indicate successful setting
	    return true;
	  }
	}));

  Alpine.store('currentPage', {
    current: 'login',
    items: ['signup', 'login']
  });


  Alpine.store('lightDarkMode', {
    current: 'light',
    items: ['light','dark']
  });

  Alpine.store('sidebarStatus', {
    current: localStorage.getItem('sidebarStatus') || 'collapsed',
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



// listen for authentication state changes

document.addEventListener('DOMContentLoaded', (event) => {
	supabase.auth.onAuthStateChange((event, session) => {
	  //console.log('Authentication state changed', event);
	  // console.log('Current Session', session);
	  // Check if the user is logged in
	  if (session) {
	    Alpine.store('authenticationStatus').current = 'loggedIn';
	    // The token is automatically stored by Supabase client, no need to manually store it
	  } else {
	    Alpine.store('authenticationStatus').current = 'loggedOut';
	    // Token is automatically removed by Supabase client when the session ends, no need to manually remove it
	  }
	});
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
// Update question text with brand name from local storage
    updateQuestionText();
  }
})();


function updateQuestionText() {
  // Get the existing data
  let interviewData = JSON.parse(window.localStorage.getItem('interviewData'));

  // Extract brand name from the interviewData
  let brand = interviewData.brandName;

  // If brandNameFromLocalStorage is not null, proceed
  if (brand !== null) {


      // Update the Alpine store
      Alpine.store('yourBrand').brandName = brand;


    document.querySelector('#q2').textContent = 'What sets ' + brand + ' apart from competitors and alternatives?';

	document.querySelector('#q50').textContent = "What's the best way to talk about what " + brand + " provides - product or service?";

	document.querySelector('#q7').textContent = "Why does  " + brand + " exist?";

	document.querySelector('#q5').textContent = "What misconception about  " + brand + " do you encounter?";

	document.querySelector('#q12').textContent = "When they hear about " + brand + ", what do you want them to think - what's your message??";

	document.querySelector('#q19').textContent = " What problems can " + brand + " not quite solve?";

	document.querySelector('#q30').textContent = "Who has a similar audience to " + brand + " but isn't really competitor?";

	document.querySelector('#q40').textContent = "How and when do customers pay for " + brand ;

	document.querySelector('#q43').textContent = "Which does " + brand + " help with *more* – increasing income or cutting costs?";




	// these need solution type and/or customer type variables
	//The problem your [solution] addresses – what kind of organization does that help the most
	//Who usually approves the decision to buy your solution?
	//28 What are the alternatives (as opposed to competitors) to your solution?
	//39Can you describe a common decision-making process for your customers? How long does it take?






  }
}





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
    Alpine.store('userProfile').firstName = data.first_name;

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
  const inviteCode = event.target[3].value; // Get the invite code from the form

  // Check if the provided invite code exists in the `signup_codes` table
  const { data: signupCodeData, error: signupCodeError } = await supabase
    .from('signup_codes')
    .select('code')
    .eq('code', inviteCode);

  if (signupCodeError || !signupCodeData || signupCodeData.length === 0) {
    // Show an error message if the invite code is incorrect
    Alpine.store('formStatus').showErrorMessage('Invalid invite code.');
    Alpine.store('formStatus').enableSubmitButton();
    return;
  }

  try {
    const response = await supabase.auth.signUp({ email, password });


    if (response.error) {
      Alpine.store('formStatus').showErrorMessage(response.error.message);
    } else {

      Alpine.store('formStatus').showSuccessMessage('Success!'); await delay(1000);
      Alpine.store('formStatus').showSuccessMessage('Success! Accounted Created.'); await delay(800);
      Alpine.store('formStatus').showSuccessMessage('Success! Accounted Created. Logging you in now..'); await delay(500);
      Alpine.store('authenticationStatus').current = 'loggedIn';

      // Get the current user's ID
      const userId = response.user.id;
	  //console.log('Signup response:', response);
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

		await createInterview();

        await getInterviewQuestions();

        const interviewId = await getInterview(userId);
        if (interview !== null && interview !== undefined) {
          //console.log('No interview found for user. Redirecting to onboarding...');

		  Alpine.store('currentScreen').current = 'maps';

      } else {


		// Store the interview in localStorage immediately after login
        window.localStorage.setItem('interviewData', JSON.stringify(interview));

		Alpine.store('currentScreen').current = 'interviews';

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

    if (response.error) {
      Alpine.store('formStatus').showErrorMessage(response.error.message);
    } else {
      Alpine.store('formStatus').showSuccessMessage('Success!');
      await delay(800);
      Alpine.store('formStatus').showSuccessMessage('Success! Loading...');
      await delay(500);

      Alpine.store('authenticationStatus').current = 'loggedIn';

      const userId = response.user.id;
      const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)

	  if (data && data.length > 0) {
	    const userProfile = data[0];
	    window.localStorage.setItem('userProfile', JSON.stringify(userProfile));
	  }

        await getInterviewQuestions();

      	const interviewId = await getInterview(userId);
		console.log(interviewId);

	  	// this is where we figure out where to send the user on logi
      	if (interview === null || !interview.hasOwnProperty('interviewID')) {

        	Alpine.store('currentScreen').current = 'maps';

    	} else {


			// Store the interviewId in localStorage immediately after login
        	window.localStorage.setItem('interviewData', JSON.stringify(interview));

			Alpine.store('currentScreen').current = 'interviews';

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

//  9.2 - Make interview questions available in Alpine store
async function getInterviewQuestions() {

    try {
        // Check if the data is already in local storage
        const localStorageData = localStorage.getItem('interviewQuestions');
        if (localStorageData) {
            Alpine.store('questions', JSON.parse(localStorageData)); // Update the Alpine store with the interview questions from local storage
        } else {
            // If data is not in local storage, fetch it
            const { data, error } = await supabase
                .from('interview_questions')
                .select('*')
                .order('sort_order');

            if (error) {
                throw error; // Throw the error to be caught by the catch block
            }

            localStorage.setItem('interviewQuestions', JSON.stringify(data)); // Store the interview questions in the local storage
            Alpine.store('questions', data); // Update the Alpine store with the interview questions from the fetch request
        }

        // Dispatch an event indicating the data has loaded
        window.dispatchEvent(new CustomEvent('questionsLoaded'));

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
	minute: 'numeric',
		 timeZoneName: 'short'
	};
	// console.log("date 1: ", date);
	return date.toLocaleString([], options);

}





// 9.3 Create and manage interviews

// make a new interview
async function createInterview() {

  // Pull the user profile from local storage
  let userProfile = JSON.parse(window.localStorage.getItem('userProfile'));
  const userId = userProfile.user_id;

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
	    // Save interviewData to local storage
	    window.localStorage.setItem('interviewData', JSON.stringify(data));

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

     // Update the Alpine store with the new interview name
     Alpine.store('interviewData').interviewName = newInterviewName;

	 // add updated brand name to local storage interviewData object
	 const newBrandName = `${brandName}`;
	 let interviewData = JSON.parse(window.localStorage.getItem('interviewData'));
	 interviewData.brandName = newBrandName;
	 window.localStorage.setItem('interviewData', JSON.stringify(interviewData));

 	// Update question text with brand name from local storage
     updateQuestionText();

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
  console.log('User ID called in GetInterview(userId):', userId);
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

   // console.log('Interview data:', interview);

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

    //console.log("saveAnswer called with questionId:", questionId);

    // Pull the interviewId from local storage
    let interviewDataString = window.localStorage.getItem('interviewData');
    let interviewData = JSON.parse(interviewDataString);

    //console.log("Fetched interview data from local storage:", interviewData);

	const currentDate = new Date();

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
		  updated_at: currentDate
        },{
          onConflict: ['interview_id', 'question_id', 'user_id']
        });

      // Here you should handle if the upsert operation ended with an error.
      // For example:
      if (error) {
        console.error('Error: ', error);
        return;
      }



      // Update interview's updated_at field
      const update = await supabase
        .from('interviews')
        .update({
          updated_at: currentDate
        })
        .eq('id', interviewId);

      // Here you should handle if the update operation ended with an error.
      // For example:
      if (update.error) {
        console.error('Error: ', update.error);
      }

	  // Update Alpine.js store
	  let store = Alpine.store('interviewData');
	  store.updatedDate = currentDate;
	  console.log("Updated date:", Alpine.store('interviewData').updatedDate);


    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
}



let animationRunning = false;  // global flag to track animation state

const autoSave = debounce(
  async function (interviewId, questionId, answer, userId, textarea) {
	  //console.log(interviewId);  // Add this line
    try {
      await saveAnswer(interviewId, questionId, answer, userId);

      // Show the snackbar notification
      const snackbar = document.getElementById(`save-confirmation-${questionId}`);
      if (!animationRunning) {
        snackbar.classList.add('show');
        animationRunning = true;

		setTimeout(() => {
		  animationRunning = false;
		  snackbar.classList.remove('show');
		}, 4000);  // Matches the total duration of the CSS animations

      }


      // check if the user has entered at least 100 characters
      if (answer.length >= 100) {
          // get the feedback div for this question
          const feedbackDiv = document.getElementById('answer-feedback-' + questionId);
          if (feedbackDiv) {
              // make the feedback div visible
              feedbackDiv.style.visibility = "visible";
          }
      }

      // Change the background color of the textarea
      textarea.classList.add("autosaveIndicator");
      setTimeout(() => {
        textarea.classList.remove("autosaveIndicator");
      }, 2000);
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  }, 3000);






  async function getFollowup(questionId, answer, questionText, questionCategory, questionLabel, questionHelp) {
      try {
          // Prepare the data to send in the body of the POST request
          const postData = {
              questionId: questionId,
              answer: answer,
              questionText: questionText,
              questionCategory: questionCategory,
              questionLabel: questionLabel,
              questionHelp: questionHelp
          };
	//console.log("get followup data prepared")


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

    //console.log('Followup question received: ', followup_question);


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

async function saveFollowupAnswer(interviewId, questionId, followupQuestion, followupAnswer, userId) {
  if (!interviewId) {
    throw new Error('Invalid interviewId');
  }
  try {
    const { data: existingData, error: existingError } = await supabase
      .from('interview_answers')
      .select("followups")
      .match({
        interview_id: interviewId,
        question_id: questionId,
        user_id: userId,
      });

    if (existingError) {
      throw existingError;
    }

    let updatedFollowups;
    const existingFollowupIndex = existingData[0]?.followups?.findIndex(followup => followup.question === followupQuestion);

    if (existingFollowupIndex !== -1 && existingFollowupIndex !== undefined) {
      updatedFollowups = [...existingData[0].followups];
      updatedFollowups[existingFollowupIndex].answer = followupAnswer;
    } else {
      const newFollowup = { question: followupQuestion, answer: followupAnswer };
      updatedFollowups = existingData[0]?.followups ? [...existingData[0].followups, newFollowup] : [newFollowup];
    }

    const { data, error } = await supabase
      .from('interview_answers')
      .update({
        followups: updatedFollowups
      })
      .match({
        interview_id: interviewId,
        question_id: questionId,
        user_id: userId,
      });

    if (error) {
      throw error;
    } else {
     // console.log('Followup answer saved successfully:', data);



      const snackbar = document.getElementById(`save-confirmation-followup-to-question-id-${questionId}`);
	  //console.log(snackbar);

      if (!animationRunning) {
        snackbar.classList.add('show');
        animationRunning = true;

		setTimeout(() => {
		  animationRunning = false;
		  snackbar.classList.remove('show');
		}, 4000);  // Matches the total duration of the CSS animations

      }


    }
  } catch (error) {
    console.error('Error saving followup answer:', error);
  }
}

const autoSaveFollowupAnswer = debounce(
  async function (interviewId, questionId, answer, userId, textarea) {
    try {
      await saveAnswer(interviewId, questionId, answer, userId);

      // Show the snackbar notification
      const snackbar = document.getElementById(`save-confirmation-${questionId}`);
      if (!animationRunning) {
        snackbar.classList.add('show');
        animationRunning = true;

		setTimeout(() => {
		  animationRunning = false;
		  snackbar.classList.remove('show');
		}, 4000);  // Matches the total duration of the CSS animations

      }

      // check if the user has entered at least 100 characters
      if (answer.length >= 100) {
          // get the feedback div for this question
          const feedbackDiv = document.getElementById('answer-feedback-' + questionId);
          if (feedbackDiv) {
              // make the feedback div visible
              feedbackDiv.style.visibility = "visible";
          }
      }

      // Change the background color of the textarea
      textarea.classList.add("autosaveIndicator");
      setTimeout(() => {
        textarea.classList.remove("autosaveIndicator");
      }, 2000);
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  }, 3000);


async function followupExists(questionId) {
  const userProfile = JSON.parse(window.localStorage.getItem('userProfile'));
  const interviewData = JSON.parse(window.localStorage.getItem('interviewData'));

  const userId = userProfile.user_id;
  const interviewId = interviewData.interviewID;

  try {
   // console.log('Calling followupExists function for question ID:', questionId);

    const { data: existingData, error: existingError } = await supabase
      .from('interview_answers')
      .select('followups')
      .match({
        interview_id: interviewId,
        question_id: questionId,
        user_id: userId,
      });

    if (existingError) {
      throw existingError;
    }

    const existingFollowups = existingData[0]?.followups || [];

    if (existingFollowups.length > 0) {
      //console.log('Follow-ups found for question ID:', questionId);

      const followUpContainer = document.getElementById('followup-to-question-id-' + questionId);

      existingFollowups.forEach(followup => {
        if (followup.question && followup.answer) {
			//console.log('followup.question:', followup.question);
			//console.log('followup.answer:', followup.answer);
            //console.log('Updating follow-up elements for question ID:', questionId);

          // Get the first (and in your case, only) p tag within the followUpContainer
          const followUpParagraph = followUpContainer.querySelector('p');
          //console.log('Paragraph element:', followUpParagraph);

          // Get the first (and in your case, only) textarea within the followUpContainer
          const followUpTextarea = followUpContainer.querySelector('textarea');
          //console.log('Textarea element:', followUpTextarea);

          followUpParagraph.textContent = followup.question;
          followUpTextarea.value = followup.answer;
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
        }
      });

      return true;
    }

    //console.log('No follow-ups found for question ID:', questionId);

    return false;
  } catch (error) {
    console.error('Error checking follow-up:', error);
    return false;
  }
}



let followup_questionCalledFlags = {};  // At the start of the script


function handleTextareaInput(event) {
  // Retrieve userId and interviewId from local storage
  const userProfile = JSON.parse(window.localStorage.getItem('userProfile'));
  const interviewData = JSON.parse(window.localStorage.getItem('interviewData'));

  const userId = userProfile.user_id;
  const interviewId = interviewData.interviewID

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
  let currentQuestion = interviewQuestions.find(q => q.id == questionId);
  let questionText = currentQuestion.question_text;
  let questionCategory = currentQuestion.question_category; // adjust this based on your actual data structure
  let questionLabel = currentQuestion.question_label; // adjust this based on your actual data structure
  let questionHelp = currentQuestion.question_help; // adjust this based on your actual data structure

  if (inputValue.length >= 50 && !followup_questionCalledFlags[questionId] && inputValue[inputValue.length - 1] === ' ') {
      followup_questionCalledFlags[questionId] = true;  // Set the flag to true before calling getFollowup
      setTimeout(() => {
          getFollowup(questionId, inputValue, questionText, questionCategory, questionLabel, questionHelp);
      }, 7000);  // 7000 milliseconds = 7 seconds
  }

}


// 9.5 parse interview answers
// Based on ID
function attachEventHandlers(textareaId) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) return;

  // Map of textarea IDs to event handlers
  const eventHandlers = {
    "input-1": handleTextareaBlur,
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

  //console.log('event.target:', event.target);
  //console.log('event.target.value:', event.target.value);

  const characterCount = event.target.value.length;

  if (characterCount >= 2) {
    const interviewDataString = window.localStorage.getItem('interviewData');
    const userProfileString = window.localStorage.getItem('userProfile');

    if (interviewDataString && userProfileString) {
      const interviewData = JSON.parse(interviewDataString);
      const userProfile = JSON.parse(userProfileString);
      const interviewId = interviewData.interviewID;
      const fullName = userProfile.full_name;

      //console.log("value pass to extractBrandName(): ", event.target.value)

      extractBrandName(event.target.value)
        .then(brandName => {
          //console.log('Brand name entered:', brandName);
		  Alpine.store('yourBrand').setBrandName(brandName);

          return updateInterview(interviewId, brandName, fullName);
        })
        .then(() => {
          //console.log('Interview name updated successfully!');

        })
        .catch((error) => {
          console.error('Error updating interview:', error);
        });
    }
  }
}

async function extractBrandName(text) {
  //console.log('extractBrandName called with:', text);

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
    //console.log("Extracted brand name: ", data); // show extracted brand name


    return data.brandName; // Return the brand name from the response



  } catch (error) {
    console.log("An error occurred:", error);
  }
}





function downloadAsMarkdown(content, fileName) {
  // Create an invisible downloadable link
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', fileName);
  element.style.display = 'none';
  document.body.appendChild(element);

  // Trigger the click event
  element.click();

  // Remove the link from the document
  document.body.removeChild(element);
}

function saveToSupabase(content, fileName) {
  const bucketName = 'public_interview_reports';
  const userId = JSON.parse(window.localStorage.getItem('userProfile'))?.user_id || null;
  const interviewId = JSON.parse(window.localStorage.getItem('interviewData'))?.interviewID || null;

  // Check if userId, interviewId, and fileName are valid
  if (!userId || !interviewId || !fileName) {
    console.error('Invalid userId, interviewId, or fileName');
    return;
  }

  const filePath = `${userId}-${interviewId}-${fileName}`;


  const cleanFilePath = filePath.replace(/\s/g, "-")

  const file = new File([content], cleanFilePath, { type: 'text/markdown' });

  // Use the upload() function provided by supabase.storage to upload the file
  supabase.storage
    .from(bucketName)
    .upload(filePath, file)
    .then((response) => {
      // Handle the response
      console.log('File uploaded successfully:', response);
    })
    .catch((error) => {
      // Handle the error
      console.error('Error uploading file:', error);
    });
}


function strategyState() {

  console.log(" strategyState() function called")

  updateUItoStrategy();

}

function updateUItoStrategy() {

  console.log(" strategyState() function called")


}



function InterviewReviewView() {
	console.log('InterviewReviewView just got called')
    return {
        categories: [
            {id: 'category_brand_story', label: 'Brand and Story'},
            {id: 'category_customer_market', label: 'Market and Audience'},
            {id: 'category_buyer_problem', label: 'Buyer and Problem'},
            {id: 'category_competitor_positioning', label: 'Competition and Positioning'},
            {id: 'solution_uvp', label: 'Solution and UVP'},
            {id: 'sales_pricing', label: 'Sales and Pricing'}
        ],
		userId: JSON.parse(window.localStorage.getItem('userProfile'))?.user_id || null,
        interviewId: JSON.parse(window.localStorage.getItem('interviewData'))?.interviewID || null,
        answeredQuestions: {},
        questions: {}, // Store the question objects here
        fetchQuestions: async function () {

            if (this.userId) {
                const { data, error } = await supabase
                    .from('interview_questions')
					.select('*');
                if (error) {
                    console.error('Error fetching questions:', error);
                    return {};
                }

		        this.questions = data.reduce((acc, item) => {
		            acc[item.id] = item;
		            return acc;
		        }, {});

            }
            return {};
        },
		fetchAnsweredQuestions: async function () {
		    //console.log("Fetching answered questions...");
		    if (this.userId && this.interviewId) {
		        const { data, error } = await supabase
		            .from('interview_answers')
    .select('question_id, answer, followups, interview_questions:question_id (question_text, question_category)')

		            .eq('interview_id', this.interviewId)
		            .eq('user_id', this.userId);
		        if (error) {
		            console.error('Error fetching answered questions:', error);
		            return;
		        }


				//console.log('Fetched answered questions data:', data);
		       // console.log('Fetched answered questions data:', data);  // Add this line
			   this.answeredQuestions = data.reduce((acc, item) => {
			       acc[item.question_id] = {
			           answer: item.answer ? item.answer : 'No answer yet',
			           question_text: item.interview_questions.question_text,
			           question_category: item.interview_questions.question_category, // Store question_category here
			           followups: item.followups ? item.followups : [] // Add followups here
			       };
			       return acc;
			   }, {});


		    }
		},
		fetchCategories: async function () {
		    // Fetch your categories here
		    const categoriesArray = await fetchYourCategories(); // This should be replaced with your actual fetch call

		    // Convert your array of objects to an object
		    this.categories = categoriesArray.reduce((acc, category) => {
		        acc[category.id] = category.label;
		        return acc;
		    }, {});
		},
		// A function to generate the markdown content
		generateMarkdownContent: function() {
		    let markdownContent = "";


		    // Retrieve interviewData from the Alpine store
		    let interviewData = Alpine.store('interviewData');

		    // Retrieve userProfile from the Alpine store
		    let userProfile = Alpine.store('userProfile');

		    // Add the interview name to the top of the markdown content
		    if (interviewData.interviewName) {
		        markdownContent += `## ${interviewData.interviewName}\n\n`;
				markdownContent += `Updated: **${interviewData.updatedDate}**\n\n`;
				markdownContent += `Interviewee: **${userProfile.data.full_name}**\n\n`;

		    }

		    // Iterate over each category
		    for (let category of this.categories) {

		        // Filter the answeredQuestions for the current category
		        let categoryQuestions = Object.values(this.answeredQuestions).filter(question => question.question_category === category.id);

		        if (categoryQuestions.length > 0) {
		            // Add the category label to the markdown content
		            markdownContent += `### ${category.label}\n`;

		            // Iterate over each question in this category
		            for (let question of categoryQuestions) {

		                // Add the question label, colon, and question text in a single element
		                let questionText = question.question_text.charAt(0).toUpperCase() + question.question_text.slice(1);
		                markdownContent += `**${questionText}**\n`;

		                // Add the question answer
		                let questionAnswer = question.answer ? question.answer : 'No answer yet';
		                markdownContent += `${questionAnswer}\n\n`;
		            }
		        }
		    }
		    this.markdownContent = markdownContent;
		},
		downloadInterview: function() {
		    this.generateMarkdownContent();
		    const interviewData = Alpine.store('interviewData');
		    const interviewName = interviewData.interviewName;
		    const currentDate = new Date().toISOString().split('T')[0];
		    const fileName = `${interviewName}-${currentDate}.md`;
		    downloadAsMarkdown(this.markdownContent, fileName);
		},
		saveInterview: function() {
		  console.log('saveInterview');
		  this.generateMarkdownContent();
		  const interviewData = Alpine.store('interviewData');
		  const interviewName = interviewData.interviewName;
		  const currentDate = new Date().toISOString().split('T')[0];
		  const fileName = `${interviewName}-${currentDate}.md`;
		  const interviewId = Alpine.store('interviewId'); // Add this line to retrieve the interviewId
		  saveToSupabase(this.markdownContent, fileName, interviewId);
		},


		async init() {
		    await this.fetchQuestions();
		    await this.generateMarkdownContent(); // Generate the Markdown content when the component is initialized
		},

	    percentAnswered: function() {
			let totalQuestions = 45;
	        let answeredQuestions = Object.keys(this.answeredQuestions).length;
	        return Math.round((answeredQuestions / totalQuestions) * 100);
	    },
		mostAnsweredCategory: function() {
		    let categoryCounts = this.categories.map(category => ({
		        category: category.label,
		        count: Object.values(this.answeredQuestions).filter(a => a.question_category === category.id).length
		    }));
		    let maxCategory = categoryCounts.reduce((a, b) => a.count > b.count ? a : b);
		    return maxCategory.category;
		},
		longestAnswer: function() {
		    if(Object.keys(this.answeredQuestions).length === 0){
		        return '';
		    }

		    let maxAnswerQuestionId = Object.keys(this.answeredQuestions).reduce((a, b) => this.answeredQuestions[a].answer.length > this.answeredQuestions[b].answer.length ? a : b);
		    return this.answeredQuestions[maxAnswerQuestionId].question_text;
		},
		mostEngagementCategory: async function() {
		    // Ensure we have the answered questions data
		    await this.fetchAnsweredQuestions();

		    // Create an array to store engagement scores per category
		    let engagementScores = this.categories.map(category => ({
		        category: category.label,
		        score: 0
		    }));

		    // For each answered question
		    for (let question_id in this.answeredQuestions) {
		        // Get the question category
		        let question_category = this.answeredQuestions[question_id].question_category;

		        // Find the corresponding category in the engagementScores array
		        let category = engagementScores.find(cat => cat.category === this.categories.find(c => c.id === question_category).label);

		        // Add the length of the answer to the score of the corresponding category
		        if (category) {
		            category.score += this.answeredQuestions[question_id].answer.length;
		        }
		    }

		    // Find the category with the highest engagement score
		    let mostEngagedCategory = engagementScores.reduce((a, b) => a.score > b.score ? a : b);

		    return mostEngagedCategory.category;
		},

		leastEngagementCategory: async function() {
		    // Ensure we have the answered questions data
		    await this.fetchAnsweredQuestions();

		    // Create an array to store engagement scores per category
		    let engagementScores = this.categories.map(category => ({
		        category: category.label,
		        score: 0
		    }));

		    // For each answered question
		    for (let question_id in this.answeredQuestions) {
		        // Get the question category
		        let question_category = this.answeredQuestions[question_id].question_category;

		        // Find the corresponding category in the engagementScores array
		        let category = engagementScores.find(cat => cat.category === this.categories.find(c => c.id === question_category).label);

		        // Add the length of the answer to the score of the corresponding category
		        if (category) {
		            category.score += this.answeredQuestions[question_id].answer.length;
		        }
		    }

		    // Find the category with the lowest engagement score
		    let leastEngagedCategory = engagementScores.reduce((a, b) => a.score < b.score ? a : b);

		    return leastEngagedCategory.category;
		},
    }
}




// SECTION 10 - Event Handlers / Listeners

document.addEventListener('DOMContentLoaded', async (event) => { //


	document.getElementById("PrintHTML").addEventListener("click", function(event){
	    event.preventDefault();  // Prevent the default link click action
	    window.print();  // Call the browser print function
	});



  document.getElementById("ApproveInterview").addEventListener("click", function(event){
    // call getStrategy() function
    strategyState();
  });



});


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
        //console.log('Child list has changed');
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
                //console.log(`Removing 'completed' class from question-${questionId}`);
              }
            } else {
              if (correspondingLi) {
                correspondingLi.classList.add('completed');
                //console.log(`Adding 'completed' class to question-${questionId}`);
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




// SECTION 11 - Helper Functions
function expandTextarea(textarea) {
    // Reset textarea height if text was deleted

}



// SECTION 12 - Error Handling

function handleError(error) {
  console.error(error);
}


// SECTION 13 - Testing & debugging

function bodyClasses() {
  return [
    Alpine.store('authenticationStatus').current,
    Alpine.store('userProfile').firstName,
    Alpine.store('currentPage').current,
    Alpine.store('currentScreen').current,
    Alpine.store('lightDarkMode').current,
    Alpine.store('sidebarStatus').current,
  ].join(' ');
}


// SECTION 14 - Deployment



// SECTION 11 - Helper Functions

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // Helper function to delay the execution of an async function

function capitalizeWords(str) {
  return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}





function toHtml(markdownText) {
    var md = window.markdownit();
    return md.render(markdownText);
}





