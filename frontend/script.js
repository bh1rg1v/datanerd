const form = document.getElementById("waitlist-form");

const emailInput = document.getElementById("email");

const messageDiv = document.getElementById("message");

const nameInput = document.getElementById("name");

const phoneInput = document.getElementById("phone");


form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = emailInput.value;

    try {

        const response = await fetch(
            "https://datanerd-czhg.onrender.com/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone
                })
            }
        );

        const data = await response.json();

        messageDiv.innerText = data.message;

        nameInput.value = "";

        emailInput.value = "";

        phoneInput.value = "";


    }

    catch (error) {

        messageDiv.innerText = "Something went wrong";

        console.log(error);

    }

});