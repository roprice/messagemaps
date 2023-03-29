


// Handle the authentication with Supabase
var SUPABASE_URL = 'https://wogivjshqopegucducyz.supabase.co'
var SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2l2anNocW9wZWd1Y2R1Y3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0NzU4MzQsImV4cCI6MTk5NDA1MTgzNH0.zj-QBJknPolKZ6TZ_t3r7aPXbhVB1bf9mmoNBBif9OM'
var supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
window.userToken = null


// Wait for the page to load and then attach the event handlers
document.addEventListener('DOMContentLoaded', function (event) {
  var signUpForm = document.querySelector('#sign-up')
  signUpForm.onsubmit = signUpSubmitted.bind(signUpForm)

  var logInForm = document.querySelector('#log-in')
  logInForm.onsubmit = logInSubmitted.bind(logInForm)

  var userDetailsButton = document.querySelector('#user-button')
  userDetailsButton.onclick = fetchUserDetails.bind(userDetailsButton)

  var logoutButtons = document.querySelectorAll('.logout-button')
  logoutButtons.forEach(function (logoutButton) {
    logoutButton.onclick = logoutSubmitted.bind(logoutButton)
  })
})


// Sign the user up
const signUpSubmitted = (event) => {
  event.preventDefault()
  console.log("Form element:", event.target); // Log the form element
  const email = event.target[0].value
  const password = event.target[1].value
  supabase.auth
    .signUp({ email, password })
    .then((response) => {
      response.error ? alert(response.error.message) : setToken(response)
    })
    .catch((err) => {
      alert(err)
    })
}


// Log the user in
const logInSubmitted = (event) => {
  event.preventDefault()
  const email = event.target[0].value
  const password = event.target[1].value
  supabase.auth
    .signIn({ email, password })
    .then((response) => {
      response.error ? alert(response.error.message) : setToken(response)
    })
    .catch((err) => {
      alert(err.response.text)
    })
}


// Get the user's details
const fetchUserDetails = () => {
  alert(JSON.stringify(supabase.auth.user()))
}


// Log the user out
const logoutSubmitted = (event) => {
  console.log('logoutSubmitted bound to ', this)
  event.preventDefault()
  supabase.auth
    .signOut()
    .then((_response) => {
      console.log('signOut successful')
      document.querySelector('#access-token').value = ''
      document.querySelector('#refresh-token').value = ''
      alert('Logout successful')
      Alpine.store('authenticationStatus').updateAuthStatus();
    })
    .catch((err) => {
      console.log('signOut error', err)
      alert(err.response.text)
    })
}



// Set the token in the UI
function setToken(response) {
  if (response.user.confirmation_sent_at && !response?.session?.access_token) {
    alert('Confirmation Email Sent')
  } else {
    document.querySelector('#access-token').value = response.session.access_token
    document.querySelector('#refresh-token').value = response.session.refresh_token
    alert('Logged in as ' + response.user.email)
    Alpine.store('authenticationStatus').updateAuthStatus();
  }
}