

  // Alpine.js state management

document.addEventListener('alpine:init', () => {

    Alpine.store('authenticationStatus', {
      current: localStorage.getItem('supabase.auth.token') ? 'loggedIn' : 'loggedOut',
      items: ['loggedIn','loggedOut'],
      updateAuthStatus: function () {
        console.log('updateAuthStatus called');
        this.current = localStorage.getItem('supabase.auth.token') ? 'loggedIn' : 'loggedOut';
      },

    });

    Alpine.store('userData', {
      firstName: '',
      email: '',
      id: '',
      messageMapIds: []
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

  Alpine.store('errorMessage', { message: '' }); // initialize the errorMessage global state

  Alpine.store('showSuccessMessage', false); // initialize the errorMessage global state

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
    Alpine.store('authenticationStatus').current,
    Alpine.store('currentPage').current,
    Alpine.store('currentScreen').current,
    Alpine.store('lightDarkMode').current,
    Alpine.store('sidebarStatus').current,
    Alpine.store('onboarding').current,
  ].join(' ');
}

