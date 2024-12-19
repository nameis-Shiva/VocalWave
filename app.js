const startBtn = document.getElementById('start-btn');
const notes = document.getElementById('notes');
const stop = document.getElementById('stop');

const read = document.getElementById('read');
const copy = document.getElementById('get');
const close = document.querySelector('#notes i');

const submit = document.getElementById('submit');
const enteredText = document.getElementById('enteredText');

var tl = gsap.timeline();
tl.from('#Listen',{
    opacity:0,
    x:0,
    duration:0.5,
    repeat:-1,
});
tl.pause()

// Checking whether webkitSpeechRecognition API is supported by the Browser or not

if (!('webkitSpeechRecognition' in window)) {
    alert("Web Speech API not supported in this browser. Try Chrome!");
  }
//   webkitSpeechRecognition is a specific implementation for Chrome, where the Web Speech API is natively supported.

else {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    // The speech recognition will continue to listen for speech continuously.

    recognition.interimResults = true;
    // True -  the recognition process provides results as they are being spoken, not just the final result.
    // False - It will only return final results, without showing interim (in-progress) transcription.

    let interimTranscript = '';
    let lastTranscript = '';
    let searchingQuery = '';
    // a variable to store interim (in-progress) speech transcription.

    let finalText = ''; // Store final transcript text

    recognition.onresult = (event) => {
        let transcript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript;
            } else {
                interimTranscript = event.results[i][0].transcript;
            }
        }
        
        // if (transcript !== lastTranscript) {
            lastTranscript = transcript; // Update the last final transcript
            finalText += transcript; // Update finalText with the latest transcript
            searchingQuery = transcript.trim().toLowerCase()
            processCommand(searchingQuery); // Process the command here
            searchingQuery = '';
            updateNotes(transcript, interimTranscript);
        // }

       
    };

    recognition.onerror = (event) => {  // If any error occured in recognition
        console.log("Error in Recognition:",event.error);
    };

    //For starting the recognition at the button click
    startBtn.addEventListener('click', () => {

        recognition.start();
        tl.play();

        // read.classList.remove('hidden');
        // get.classList.remove('hidden');
        stop.classList.remove('hidden');
        close.classList.toggle('hidden');
        notes.classList.remove('hidden')

        notes.style.border = '3px solid rgb(159, 159, 128)';
        notes.style.padding = '15px';

        copy.innerHTML = "Copy Text"
        copy.style.backgroundColor = "rgb(53, 168, 53)";

        startBtn.classList.add('hidden')

    })

    function updateNotes(finalText, inProgressText) {
        
        // Clear previous interim results
        notes.querySelectorAll('.inProgress').forEach(el => el.remove());


        if(finalText){
            const note = document.createElement('p');
            note.textContent = finalText;
            notes.append(note);
        }

        if(inProgressText){
            const inProgressNote = document.createElement('p');
            inProgressNote.classList.add('inProgress');
            inProgressNote.textContent = inProgressText;
            notes.append(inProgressNote);
        }
    }

    //For Stoping
    stop.addEventListener('click',() => {
        recognition.stop(); // Stop the speech recognition
        tl.pause(); // Pause the GSAP animation if needed

        read.classList.remove('hidden');
        get.classList.remove('hidden');
        stop.classList.toggle('hidden');
        close.classList.toggle('hidden');
        startBtn.classList.remove('hidden')

        document.getElementById('Listen').style.opacity = 0;

    })

    submit.addEventListener('click', () => {
        notes.querySelectorAll('p').forEach(el => el.remove());
        finalText = enteredText.value;
        updateNotes(finalText, '');
        enteredText.value = ''; // Clear the input field after submission
       
        notes.classList.remove("hidden");
        read.classList.remove('hidden');
        notes.style.border = '3px solid rgb(159, 159, 128)';
        notes.style.padding = '15px';
    })

    //For reading the Text
    read.addEventListener('click',()=>{
        speakText(finalText)
    });

    function speakText(text) {
        // Check if SpeechSynthesis is supported
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in this browser.');
        }
    }

    //Copy Button
    copy.addEventListener('click', function () {
        let copiedText = finalText;
        // let copiedText = document.querySelectorAll('#notes p').innerText;
        navigator.clipboard.writeText(copiedText).then(function(){
            copy.innerHTML = "Copied"
            copy.style.backgroundColor = "grey"
        })
    })

    // Close Button
    close.addEventListener('click', () => {
    notes.querySelectorAll('p').forEach(el => el.remove());
    notes.classList.add('hidden');
    })

    

    function processCommand(command) {
        console.log("Processing command:", command); // For debugging
        
        if (/open google/.test(command)) {
            console.log("Opening Google");
            window.open('https://www.google.com', '_blank');
        } else if (/open youtube/.test(command)) {
            console.log("Opening YouTube");
            window.open('https://www.youtube.com', '_blank');
        } else if (/search for (.+)/.test(command)) {
            let searchQuery = command.match(/search for (.+)/)[1].trim();
            console.log("Searching for:", searchQuery);
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
        }else if (/i want to known about (.+)/.test(command)) {
            let searchQuery = command.match(/i want to known about (.+)/)[1].trim();
            console.log("Searching for:", searchQuery);
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
        } else if (/play song on spotify/.test(command)) {
            console.log("Opening Spotify");
            window.open('https://open.spotify.com/', '_blank');
        } else if (/open twitter/.test(command)) {
            console.log("Opening Twitter");
            window.open('https://twitter.com', '_blank');
        } else if (/go to (.+)/.test(command)) {
            let site = command.match(/go to (.+)/)[1].trim();
            console.log("Going to site:", site);
            if (!site.startsWith("http")) {
                site = "https://" + site;
            }
            window.open(site, '_blank');
        } else if (/what time is it/.test(command)) {
            let now = new Date();
            let currentTime = now.toLocaleTimeString();
            console.log("Current time:", currentTime);
            speakText(`The current time is ${currentTime}`);
        } else if (/close this tab/.test(command)) {
            console.log("Closing tab");
            window.close();
        } else if (/show alert/.test(command)) {
            console.log("Showing alert");
            alert("This is an alert triggered by voice command!");
        } else {
            console.log("Command not recognized:", command);
        }

    }
    
}
