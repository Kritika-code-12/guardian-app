// Element references
const sosBtn = document.getElementById('sos-btn');
const sosStatus = document.getElementById('sos-status');
const sirenAudio = document.getElementById('siren-audio');
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
  // Play the siren instead of showing an alert message
  sosStatus.textContent = "Siren playing";
  // Ensure siren state and UI are synced
  isSirenOn = true;
  try {
    sirenAudio.play();
  } catch (e) {
    console.warn('Unable to play siren audio:', e);
  }
};

const deactivateSOS = () => {
  isSOSActive = false;
  sosBtn.classList.add('animate-pulse');
  sosBtn.classList.remove('bg-red-600');
  sosBtn.innerHTML = `<span class="text-4xl font-bold">SOS</span><span class="text-sm opacity-90">HOLD FOR 3 SEC</span>`;
  sosStatus.textContent = "";
  // Stop siren if SOS started it
  if (isSirenOn) {
    sirenAudio.pause();
    sirenAudio.currentTime = 0;
    isSirenOn = false;
  }
};

// SOS events
sosBtn.addEventListener('mousedown', startSOS);
sosBtn.addEventListener('touchstart', startSOS);
sosBtn.addEventListener('mouseup', cancelSOS);
sosBtn.addEventListener('mouseleave', cancelSOS);
sosBtn.addEventListener('touchend', cancelSOS);
sosBtn.addEventListener('click', () => {
  // Toggle SOS on click: start siren when activating, stop when cancelling
  if (isSOSActive) {
    deactivateSOS();
  } else {
    activateSOS();
  }
});

// Siren toggle
let isSirenOn = false;
// (Siren button removed from HTML) siren is controlled by SOS only

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
// Track button removed from UI; keep `startLocationTracking` available if needed

callBtn.addEventListener('click', () => {
  showAlert('Calling Police', 'Opening dialer for 112...', 'fa-phone-alt', 'red-500');
  window.location.href = 'tel:112';
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
    contactEl.className = 'contact-card';

    contactEl.innerHTML = `
      <div class="flex items-center">
        <div class="profile-pink">${contact.name.charAt(0).toUpperCase()}</div>
        <div>
          <p class="font-semibold text-secondary-color">${contact.name}</p>
          <p class="text-sm text-gray-500">${contact.phone}</p>
        </div>
      </div>
      <div class="contact-actions">
        <a href="tel:${contact.phone}" title="Call ${contact.name}">
          <i class="fas fa-phone-alt text-green-500 rotate-90"></i>
        </a>
        <button onclick="deleteContact(${index})" title="Delete ${contact.name}">
          <i class="fas fa-trash-alt text-gray-400"></i>
        </button>
      </div>
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

document.getElementById('share-loc-btn').addEventListener('click', () => {
  // 1. Fetch your existing contacts list
  const contacts = JSON.parse(localStorage.getItem('guardianContacts') || '[]');

  if (contacts.length === 0) {
    showAlert('No Contacts', 'Add your guardians in the Contacts tab first!', 'fa-user-friends', 'indigo-500');
    return;
  }

  //location process
  sosStatus.textContent = "Getting Location...";
  
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    
    // Creating the standard Google Maps Link
    const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const message = `EMERGENCY ALERT! I need help. My current location is: ${mapLink}`;

    //Joining all phone numbers with a comma
    const phoneList = contacts.map(c => c.phone).join(',');

    //triggering the SMS app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrl = isIOS 
      ? `sms:${phoneList}&body=${encodeURIComponent(message)}`
      : `sms:${phoneList}?body=${encodeURIComponent(message)}`;

    //redirection
    sosStatus.textContent = "";
    window.location.href = smsUrl;

  }, (error) => {
    sosStatus.textContent = "";
    showAlert('GPS Error', 'Please enable location to send alerts.', 'fa-map-marker-alt', 'red-500');
  }, { enableHighAccuracy: true });
});

// Load contacts on page load
document.addEventListener('DOMContentLoaded', () => {
  updateTime();
  loadContacts();
});
