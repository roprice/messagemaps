


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
  const email = event.target[0].value;
  const password = event.target[1].value;
  try {
    const response = await supabase.auth.signUp({ email, password });
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
      console.log('signed up and signed in successfully');
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
      document.querySelector('#access-token').value = ''
      document.querySelector('#refresh-token').value = ''
      Alpine.store('authenticationStatus').updateAuthStatus();
    })
    .catch((err) => {
      console.log('signOut error', err)
      alert(err.response.text)
    })
}


// Set the token in the UI
function setToken(response) {
  if (response.user.confirmation_sent_at) {
    if (!response || !response.session || !response.session.access_token) {
      Alpine.store('authMessage', 'Confirmation Email Sent');
    } else {
      document.querySelector('#access-token').value = response.session.access_token;
      document.querySelector('#refresh-token').value = response.session.refresh_token;
      Alpine.store('authMessage', 'Logged in as ' + response.user.email);
      Alpine.store('authenticationStatus').updateAuthStatus();
    }
  }
}


