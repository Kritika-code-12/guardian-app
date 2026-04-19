// ==========================================
// 1. Element References & Global State
// ==========================================
const sosBtn = document.getElementById('sos-btn');
const sosStatus = document.getElementById('sos-status');
const sirenAudio = document.getElementById('siren-audio');
const callBtn = document.getElementById('call-btn');
const shareLocBtn = document.getElementById('share-loc-btn');

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

// State variables
let sosHoldTimer;
let isSOSActive = false;
let isSirenOn = false;

// ==========================================
// 2. SOS & Siren Logic
// ==========================================
const startSOS = () => {
  if (isSOSActive) return;
  sosStatus.textContent = "Hold on...";
  sosStatus.classList.add('opacity-100');
  sosHoldTimer = setTimeout(activateSOS, 3000);
};

const cancelSOS = () => {
  if (isSOSActive) return;
  clearTimeout(sosHoldTimer);
  sosStatus.textContent = "";
  sosStatus.classList.remove('opacity-100');
};

const activateSOS = () => {
  isSOSActive = true;
  sosBtn.classList.remove('animate-pulse');
  sosBtn.classList.add('bg-red-600');
  sosBtn.innerHTML = `<i class="fas fa-times text-4xl"></i><span class="text-sm opacity-90">CANCEL</span>`;
  sosStatus.textContent = "Siren playing";
  isSirenOn = true;
  try {
    sirenAudio.play();
  } catch (e) {
    console.warn('Siren audio error:', e);
  }
};

const deactivateSOS = () => {
  isSOSActive = false;
  sosBtn.classList.add('animate-pulse');
  sosBtn.classList.remove('bg-red-600');
  sosBtn.innerHTML = `<span class="text-4xl font-bold">SOS</span><span class="text-sm opacity-90">HOLD FOR 3 SEC</span>`;
  sosStatus.textContent = "";
  if (isSirenOn) {
    sirenAudio.pause();
    sirenAudio.currentTime = 0;
    isSirenOn = false;
  }
};

// Events for SOS Button
sosBtn.addEventListener('mousedown', startSOS);
sosBtn.addEventListener('touchstart', startSOS);
sosBtn.addEventListener('mouseup', cancelSOS);
sosBtn.addEventListener('mouseleave', cancelSOS);
sosBtn.addEventListener('touchend', cancelSOS);
sosBtn.addEventListener('click', () => {
  if (isSOSActive) deactivateSOS();
  else activateSOS();
});

// ==========================================
// 3. Location & SMS Feature
// ==========================================
if (shareLocBtn) {
  shareLocBtn.addEventListener('click', () => {
    const contacts = JSON.parse(localStorage.getItem('guardianContacts') || '[]');

    if (contacts.length === 0) {
      showAlert('No Contacts', 'Add your guardians in the Contacts tab first!', 'fa-user-friends', 'indigo-500');
      return;
    }

    sosStatus.textContent = "Getting Location...";

    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      
      // Standard Google Maps link format: ?q=lat,lon
      const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = `EMERGENCY! I need help. My location: ${mapLink}`;
      
      const phoneList = contacts.map(c => c.phone).join(',');
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      const smsUrl = isIOS 
        ? `sms:${phoneList}&body=${encodeURIComponent(message)}`
        : `sms:${phoneList}?body=${encodeURIComponent(message)}`;

      sosStatus.textContent = "";
      window.location.href = smsUrl;

    }, (error) => {
      sosStatus.textContent = "";
      showAlert('GPS Error', 'Please enable location permissions.', 'fa-map-marker-alt', 'red-500');
    }, { enableHighAccuracy: true });
  });
}

// ==========================================
// 4. Contact Management
// ==========================================
function loadContacts() {
  const contacts = JSON.parse(localStorage.getItem('guardianContacts') || '[]');
  contactListContainer.innerHTML = '';

  contacts.forEach((contact, index) => {
    const contactEl = document.createElement('div');
    contactEl.className = 'contact-card flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-3';

    contactEl.innerHTML = `
      <div class="flex items-center">
        <div class="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold mr-3">
          ${contact.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p class="font-semibold text-secondary-color">${contact.name}</p>
          <p class="text-sm text-gray-500">${contact.phone}</p>
        </div>
      </div>
      <div class="flex space-x-4">
        <a href="tel:${contact.phone}"><i class="fas fa-phone-alt text-green-500"></i></a>
        <button onclick="deleteContact(${index})"><i class="fas fa-trash-alt text-red-400"></i></button>
      </div>
    `;
    contactListContainer.appendChild(contactEl);
  });
}

// Attach to window so HTML onclick can find it
window.deleteContact = function(index) {
  const contacts = JSON.parse(localStorage.getItem('guardianContacts') || '[]');
  contacts.splice(index, 1);
  localStorage.setItem('guardianContacts', JSON.stringify(contacts));
  loadContacts();
};

addContactBtn.addEventListener('click', () => {
  const name = prompt("Enter contact name:");
  const phone = prompt("Enter phone number:");
  if (name && phone) {
    const contacts = JSON.parse(localStorage.getItem('guardianContacts') || '[]');
    contacts.push({ name, phone });
    localStorage.setItem('guardianContacts', JSON.stringify(contacts));
    loadContacts();
    showAlert('Contact Added', `${name} is now a Guardian.`, 'fa-user-plus', 'green-500');
  }
});

// ==========================================
// 5. Navigation & UI Helpers
// ==========================================
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetScreenId = item.dataset.screen;
    if (!screens[targetScreenId]) return;

    navItems.forEach(nav => nav.classList.remove('active', 'text-primary-color'));
    item.classList.add('active', 'text-primary-color');

    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[targetScreenId].classList.remove('hidden');
  });
});

function showAlert(title, message, iconClass, iconColorClass) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalIcon.className = `fas ${iconClass} text-5xl mb-4 text-${iconColorClass}`;
  alertModal.classList.remove('opacity-0', 'pointer-events-none');
  alertModal.querySelector('.modal-content').classList.remove('scale-95');
}

modalCloseBtn.addEventListener('click', () => {
  alertModal.classList.add('opacity-0', 'pointer-events-none');
});

callBtn.addEventListener('click', () => {
  window.location.href = 'tel:112';
});

function updateTime() {
  const greetingEl = document.getElementById('greeting');
  const hours = new Date().getHours();
  let msg = hours < 12 ? 'Good Morning!' : hours < 18 ? 'Good Afternoon!' : 'Good Evening!';
  greetingEl.textContent = `${msg} Stay safe.`;
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  updateTime();
  loadContacts();
});
