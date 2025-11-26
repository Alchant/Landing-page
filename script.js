// List IDs - These are public identifiers, safe to expose
const LISTS = {
    creator: '711fac49-a077-4959-bd55-7a13ac072bef',  // Vanzator list
    buyer: '2188e923-f10e-49fd-b890-967a2118fd49'      // Cumparator list
};

// Modal Elements
const modal = document.getElementById('emailModal');
const closeBtn = document.querySelector('.close');
const emailForm = document.getElementById('emailForm');
const emailInput = document.getElementById('emailInput');
const submitBtn = document.getElementById('submitBtn');
const responseMessage = document.getElementById('responseMessage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');

let currentList = '';

// Button Click Handlers
document.querySelector('.btn-creator').addEventListener('click', function() {
    currentList = 'creator';
    modalTitle.textContent = 'Sunt Creator';
    modalDescription.textContent = 'Alătură-te comunității noastre de creatori!';
    openModal();
});

document.querySelector('.btn-cumparator').addEventListener('click', function() {
    currentList = 'buyer';
    modalTitle.textContent = 'Sunt Cumpărător';
    modalDescription.textContent = 'Descoperă produse autentice create cu pasiune!';
    openModal();
});

// Modal Functions
function openModal() {
    modal.style.display = 'flex';
    emailInput.value = '';
    responseMessage.textContent = '';
    emailInput.focus();
}

function closeModal() {
    modal.style.display = 'none';
}

// Close button click
closeBtn.addEventListener('click', closeModal);

// Click outside modal to close
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

// Form Submission
emailForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showMessage('Te rugăm să introduci o adresă de email validă.', 'error');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Se trimite...';
    
    try {
        // Send to SendGrid
        const success = await addContactToSendGrid(email, currentList);
        
        if (success) {
            showMessage('Mulțumim! Te-ai abonat cu succes!', 'success');
            setTimeout(() => {
                closeModal();
            }, 2000);
        } else {
            showMessage('A apărut o eroare. Te rugăm să încerci din nou.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('A apărut o eroare. Te rugăm să încerci din nou.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Trimite';
    }
});

// SendGrid API Function via Vercel Serverless Function
async function addContactToSendGrid(email, listType) {
    const listId = LISTS[listType];
    
    try {
        // Call Vercel serverless function
        const response = await fetch('/api/add-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                listId: listId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return true;
        } else {
            console.error('API error:', result.error);
            return false;
        }
    } catch (error) {
        console.error('Network error:', error);
        return false;
    }
}

// Show message function
function showMessage(message, type) {
    responseMessage.textContent = message;
    responseMessage.className = type;
    responseMessage.style.display = 'block';
}

// ESC key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
    }
});
