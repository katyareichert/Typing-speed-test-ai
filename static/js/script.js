import { paragraphs } from './paragraphs.js';

const typingText = $(".typing-text"),
      inpField = $(".wrapper .input-field"),
      tryAgainBtn = $(".content button"),
      timeTag = $(".time span b"),
      mistakeTag = $(".mistake span"),
      wpmTag = $(".wpm span"),
      cpmTag = $(".cpm span");

let timer,
    maxTime = 60,
    timeLeft = maxTime,
    charIndex = 0,
    mistakes = 0,
    isTyping = 0;

function loadParagraph() {
    const ranIndex = Math.floor(Math.random() * paragraphs.length);
    typingText.empty();
    $.each(paragraphs[ranIndex].split(""), function(_, char) {
        typingText.append(`<span>${char}</span>`);
    });
    typingText.find("span").first().addClass("active");
    $(document).on("keydown", () => inpField.focus());
    typingText.on("click", () => inpField.focus());
}

function initTyping() {
    const characters = typingText.find("span");
    const typedChar = inpField.val().split("")[charIndex];
    
    if (charIndex < characters.length - 1 && timeLeft > 0) {
        if (!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
        }
        
        if (typedChar == null) {
            if (charIndex > 0) {
                charIndex--;
                if (characters.eq(charIndex).hasClass("incorrect")) {
                    mistakes--;
                }
                characters.eq(charIndex).removeClass("correct incorrect");
            }
        } else {
            if (characters.eq(charIndex).text() === typedChar) {
                characters.eq(charIndex).addClass("correct");
            } else {
                mistakes++;
                characters.eq(charIndex).addClass("incorrect");
            }
            charIndex++;
        }
        
        characters.removeClass("active");
        characters.eq(charIndex).addClass("active");

        let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60);
        wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

        wpmTag.text(wpm);
        mistakeTag.text(mistakes);
        cpmTag.text(charIndex - mistakes);
    } else {
        clearInterval(timer);
        inpField.val("");
    }
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeTag.text(timeLeft);
        let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60);
        wpmTag.text(wpm);
    } else {
        clearInterval(timer);
    }
}

function resetGame() {
    // Clear the keypress log on the server
    $.ajax({
        type: "POST",
        url: "/clear_log",
        success: function(response) {
            console.log(response.message);
        },
        error: function(error) {
            console.error("Error clearing log:", error);
        }
    });

    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    charIndex = mistakes = isTyping = 0;
    inpField.val("");
    timeTag.text(timeLeft);
    wpmTag.text(0);
    mistakeTag.text(0);
    cpmTag.text(0);
}

$(window).on("load", function() {
    loadParagraph();
    inpField.on("input", initTyping);
    tryAgainBtn.on("click", resetGame);
});

$(document).ready(function() {
    inpField.on("input", function(e) {
        const typedChar = e.originalEvent.data || ""; // Get typed character
        const timestamp = new Date().toISOString(); // Current timestamp

        // Send keypress data to the server
        $.ajax({
            type: "POST",
            url: "/log_keypress",
            contentType: "application/json",
            data: JSON.stringify({
                key: typedChar,
                timestamp: timestamp
            }),
            success: function(response) {
                console.log("Keypress logged:", response);
            },
            error: function(error) {
                console.error("Error logging keypress:", error);
            }
        });
    });
});

