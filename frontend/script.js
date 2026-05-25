const form = document.getElementById("waitlist-form");

const nameInput = document.getElementById("name");

const emailInput = document.getElementById("email");

const phoneInput = document.getElementById("phone");

const messageDiv = document.getElementById("message");


form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = nameInput.value;

    const email = emailInput.value;

    const phone = phoneInput.value;

    try {

        const response = await fetch(
            "https://datanerd-czhg.onrender.com/waitlist",
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

        console.log(data);

        messageDiv.innerText = data.message;

        nameInput.value = "";

        emailInput.value = "";

        phoneInput.value = "";

    }

    catch (error) {

        console.log(error);

        messageDiv.innerText = "Something went wrong";

    }

});