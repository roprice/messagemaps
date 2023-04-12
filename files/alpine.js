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