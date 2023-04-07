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

  var userDetailsButton = document.querySelector('#user-button')
  userDetailsButton.onclick = fetchUserDetails.bind(userDetailsButton)

  var logoutButtons = document.querySelectorAll('.logout-button')
  logoutButtons.forEach(function (logoutButton) {
    logoutButton.onclick = logoutSubmitted.bind(logoutButton)
  })
})


// Sign the user up
const signUpSubmitted = async (event) => {
  event.preventDefault();
  Alpine.store('formStatus').disableSubmitButton();
  const firstName = event.target[0].value; // Get the first name from the form
  const email = event.target[1].value; // Get the email address from the form
  const password = event.target[2].value;

  try {
    const response = await supabase.auth.signUp({ email, password });

    if (response.error) {
      Alpine.store('formStatus').showErrorMessage(response.error.message);
      console.error(response.error.message); // Log the error message

    } else {
      setToken(response);
      Alpine.store('formStatus').showSuccessMessage('Success!');
      await delay(1000);
      Alpine.store('formStatus').showSuccessMessage('Success! Accounted Created.');
      await delay(800);
      Alpine.store('formStatus').showSuccessMessage('Success! Accounted Created. Logging you in now..');
      await delay(500);
      Alpine.store('authenticationStatus').current = 'loggedIn';
      console.log('signed up and signed in successfully');
    }

    // Get the current user's ID
    const userId = response.user.id;

    // Create a new profile entry in the 'user_profiles' table
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(
        {
          user_id: userId,
          first_name: firstName, // Set the first name from the form
          // Set default values for the other profile fields (e.g., empty strings)
          last_name: '',
          role: ''
        }

      );

    if (error) {
      console.error('Error creating profile:', error);
    } else {
      console.log('Profile created successfully:', data);
    }


  } catch (err) {
    Alpine.store('formStatus').showErrorMessage(err.message);
  } finally {
    Alpine.store('formStatus').enableSubmitButton();
  }
};


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
      setToken(response);
      getInterviewQuestions();
      Alpine.store('authenticationStatus').current = 'loggedIn';
      console.log('signin successful');
    }
  } catch (err) {
    Alpine.store('formStatus').showErrorMessage(err.message);
  } finally {
    Alpine.store('formStatus').enableSubmitButton();
  }
};


// Get the user's details
const fetchUserDetails = () => {
  alert(JSON.stringify(supabase.auth.user()))
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


function setToken(response) {
  if (response.user.confirmation_sent_at) {
    if (!response || !response.session || !response.session.access_token) {
      console.log('Confirmation Email Sent');
    } else {
      console.log('sT Access Token:', response.session.access_token);
      console.log('Refresh Token:', response.session.refresh_token);
      console.log('Logged in as', response.user.email);
      // If you still need to call the updateAuthStatus method, you can keep this line.
      // Otherwise, you can remove it.
      Alpine.store('authenticationStatus').updateAuthStatus();
    }
  }
}


function interviewForm() {
  return {
    questions: [],
    answers: {},
    categories: {
      'YourBrand': 'category_brand',
      'YourCustomer': 'category_customer',
      'YourBuyer': 'category_buyer',
      'YourCompetition': 'category_competitor_positioning',
      'YourSolution': 'category_solution',
      'YourPricing': 'category_pricing'
    },
    activeTab: 'YourBrand',
    authToken: null,
    async updateAuthStatus() {
      this.authToken = await supabase.auth.session()?.access_token;
      console.log('i Auth token:', this.authToken);
      // Call the getInterviewQuestions method after the authToken is set
      await this.getInterviewQuestions();
    }

    ,

    async getInterviewQuestions() {
      try {
        // Get the current session and access token
        const session = supabase.auth.session();
        const accessToken = session?.access_token;

        // Log the access token
        console.log('Access token:', accessToken);

        // Check if the user is authenticated (accessToken is not null)
        if (accessToken) {
          // Define the headers for the API request
          const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': 'YOUR_API_KEY'
          };

          // Log the headers object
          console.log('Headers:', headers);

          // Define the API endpoint to fetch your interview questions
          const apiUrl = 'https://wogivjshqopegucducyz.supabase.co/rest/v1/interview_questions';

          // Make the API request with the access token in the Authorization header
          const response = await fetch(apiUrl, { headers });

          // Check if the response is successful (status code 200-299)
          if (response.ok) {
            // Parse the response JSON and log the questions
            const questions = await response.json();
            console.log('Interview questions:', questions);
          } else {
            // Log the error message if the response is not successful
            console.error('API response:', response.statusText);
          }
        } else {
          // Handle the case when the user is not authenticated
          console.log('User is not authenticated');
        }
      } catch (error) {
        // Log any errors that occur during the API request
        console.error('Error fetching interview questions:', error);
      }
    }

    ,


    submitForm() {
      // Handle form submission here
    }
  };
}