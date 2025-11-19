// Element references
const sosBtn = document.getElementById('sos-btn');
const sosStatus = document.getElementById('sos-status');
const sirenBtn = document.getElementById('siren-btn');
const sirenAudio = document.getElementById('siren-audio');
const trackBtn = document.getElementById('track-btn');
const callBtn = document.getElementById('call-btn');
const alertModal = document.getElementById('alert-modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');
const navItems = document.querySelectorAll('.nav-item');
const screens = {
  'home-screen': document.getElementById('home-screen'),
  'contacts-screen': document.getElementById('contacts-screen')
};
const contactListContainer = document.getElementById('contact-list-container');
const addContactBtn = document.getElementById('add-contact-btn');

// SOS logic
let sosHoldTimer;
let isSOSActive = false;

const startSOS = () => {
  if (isSOSActive) return;
  sosStatus.textContent = "Hold on...";
  sosStatus.classList.add('opacity-100');
  sosHoldTimer = setTimeout(activateSOS, 3000);
};

const cancelSOS = () => {
  clearTimeout(sosHoldTimer);
  sosStatus.textContent = "";
  sosStatus.classList.remove('opacity-100');
};

const activateSOS = () => {
  isSOSActive = true;
  sosBtn.classList.remove('animate-pulse');
  sosBtn.classList.add('bg-red-600');
  sosBtn.innerHTML = `<i class="fas fa-times text-4xl"></i><span class="text-sm opacity-90">CANCEL</span>`;
  sosStatus.textContent = "Alert Sent! Authorities Notified.";
  showAlert('SOS Activated!', 'Your location has been shared with emergency contacts and authorities.', 'fa-shield-alt', 'blue-500');
};

const deactivateSOS = () => {
  isSOSActive = false;
  sosBtn.classList.add('animate-pulse');
  sosBtn.classList.remove('bg-red-600');
  sosBtn.innerHTML = `<span class="text-4xl font-bold">SOS</span><span class="text-sm opacity-90">HOLD FOR 3 SEC</span>`;
  sosStatus.textContent = "";
};

// SOS events
sosBtn.addEventListener('mousedown', startSOS);
sosBtn.addEventListener('touchstart', startSOS);
sosBtn.addEventListener('mouseup', cancelSOS);
sosBtn.addEventListener('mouseleave', cancelSOS);
sosBtn.addEventListener('touchend', cancelSOS);
sosBtn.addEventListener('click', () => {
  if (isSOSActive) deactivateSOS();
});

// Siren toggle
let isSirenOn = false;

sirenBtn.addEventListener('click', () => {
  isSirenOn = !isSirenOn;
  if (isSirenOn) {
    sirenAudio.play();
    sirenBtn.classList.add('bg-primary-color', 'text-white');
    sirenBtn.querySelector('i').classList.replace('text-primary-color', 'text-white');
  } else {
    sirenAudio.pause();
    sirenAudio.currentTime = 0;
    sirenBtn.classList.remove('bg-primary-color', 'text-white');
    sirenBtn.querySelector('i').classList.replace('text-white', 'text-primary-color');
  }
});

// Real-time location tracking
function startLocationTracking() {
  if (!navigator.geolocation) {
    showAlert('Location Error', 'Geolocation is not supported by your browser.', 'fa-exclamation-triangle', 'red-500');
    return;
  }

  navigator.geolocation.watchPosition(
    position => {
      const { latitude, longitude } = position.coords;
      document.getElementById('location-text').textContent = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
    },
    error => {
      showAlert('Tracking Failed', error.message, 'fa-exclamation-circle', 'red-500');
    },
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
  );
}

// Track Me & Call Police
trackBtn.addEventListener('click', () => {
  showAlert('Tracking Started', 'Your journey is now being shared live with your emergency contacts.', 'fa-route', 'indigo-500');
  startLocationTracking();
});

callBtn.addEventListener('click', () => {
  showAlert('Calling Police', 'Opening dialer for 100...', 'fa-phone-alt', 'red-500');
  window.location.href = 'tel:100';
});

// Alert modal logic
function showAlert(title, message, iconClass = 'fa-check-circle', iconColorClass = 'green-500') {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalIcon.className = `fas ${iconClass} text-5xl mb-4 ${iconClass === 'fa-phone-alt' ? '-scale-x-100' : ''}`;

  const colors = ['green-500', 'blue-500', 'indigo-500', 'red-500', 'gray-500'];
  colors.forEach(c => modalIcon.classList.remove(`text-${c}`));
  modalIcon.classList.add(`text-${iconColorClass}`);

  alertModal.classList.remove('opacity-0', 'pointer-events-none');
  alertModal.querySelector('.modal-content').classList.remove('scale-95');
}

modalCloseBtn.addEventListener('click', () => {
  alertModal.classList.add('opacity-0', 'pointer-events-none');
  alertModal.querySelector('.modal-content').classList.add('scale-95');
});

// Navigation logic
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetScreenId = item.dataset.screen;

    if (!screens[targetScreenId]) {
      showAlert('Feature Coming Soon', `The ${item.querySelector('span').textContent} feature is currently under development.`, 'fa-tools', 'gray-500');
      return;
    }

    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[targetScreenId].classList.remove('hidden');
  });
});

// Greeting logic
function updateTime() {
  const greetingEl = document.getElementById('greeting');
  const hours = new Date().getHours();

  if (hours < 12) {
    greetingEl.textContent = 'Good Morning! Stay safe.';
  } else if (hours < 18) {
    greetingEl.textContent = 'Good Afternoon! Be aware.';
  } else {
    greetingEl.textContent = 'Good Evening! Stay vigilant.';
  }
}

// Contact management
function loadContacts() {
  const contacts = JSON.parse(localStorage.getItem('guardianContacts') || '[]');
  contactListContainer.innerHTML = '';

  contacts.forEach((contact, index) => {
    const contactEl = document.createElement('div');
    contactEl.className = 'bg-light-bg p-4 rounded-xl flex items-center justify-between mb-3';
    contactEl.innerHTML = `
      <div class="flex items-center">
        <div class="rounded-full w-12 h-12 flex items-center justify-center bg-primary-color text-white font-bold mr-4">${contact.name.charAt(0)}</div>
        <div>
          <p class="font-semibold text-secondary-color">${contact.name}</p>
          <p class="text-sm text-gray-500">${contact.phone}</p>
        </div>
      </div>
      <button class="text-gray-400 hover:text-red-500 transition" onclick="deleteContact(${index})">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    contactListContainer.appendChild(contactEl);
  });
}

function deleteContact(index) {
  const contacts = JSON.parse(localStorage.getItem('guardianContacts') || '[]');
  contacts.splice(index, 1);
  localStorage.setItem('guardianContacts', JSON.stringify(contacts));
  loadContacts();
}

addContactBtn.addEventListener('click', () => {
  const name = prompt("Enter contact name:");
  const phone = prompt("Enter phone number:");
  if (name && phone) {
    const contacts = JSON.parse(localStorage.getItem('guardianContacts') || '[]');
    contacts.push({ name, phone });
    localStorage.setItem('guardianContacts', JSON.stringify(contacts));
    loadContacts();
    showAlert('Contact Added', `${name} has been added to your emergency contacts.`, 'fa-user-plus', 'green-500');
  } else {
    showAlert('Invalid Input', 'Both name and phone number are required.', 'fa-exclamation-circle', 'red-500');
  }
});

// Load contacts on page load
document.addEventListener('DOMContentLoaded', () => {
  updateTime();
  loadContacts();

});
