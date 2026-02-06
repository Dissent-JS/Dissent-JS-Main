import './invite.scss'

export default class invite {
  constructor(element) {
    this.element = element
  }

  async init() {
    if (process.env.NODE_ENV !== 'production') {
      try {
        const response = await fetch('components/invite/invite.html');
        const invitehtml = await response.text();
        this.element.innerHTML = invitehtml;
      } catch (error) {
        console.error('Failed to load invite component:', error);
        return;
      }
    }

    const inviteForm = document.getElementById('invite-form');
    if (inviteForm) {
      inviteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        // Send an invitation to the specified email
        console.log(email);
      });
    }
  }
}
