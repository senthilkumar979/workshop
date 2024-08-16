async function getAccountDetails() {
    let token = sessionStorage.getItem("token");
    if(!token){
        token = localStorage.getItem("token");
    }

    await fetch("http://localhost:9050/api/myaccount", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((res) => res.json())
        .then((result) => {
            if (result) {
                sessionStorage.setItem("userDetails", JSON.stringify(result));
            }
        });
}

async function login(event) {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    event.preventDefault();
    if (email.value && password.value) {
        await fetch("http://localhost:9050/api/authenticate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value,
            }),
        })
            .then((res) => {
                const bearerToken = res.headers.get("Authorization");
                if (bearerToken && bearerToken.startsWith("Bearer")) {
                    const jwt = bearerToken.slice(7, bearerToken.length);
                    const rememberMe = document.getElementById("rememberMe");
                    if (rememberMe.checked) {
                        localStorage.setItem("token", jwt);
                    } else {
                        sessionStorage.setItem("token", jwt);
                    }
                }
                return res.json();
            })
            .then((result) => {
                if (result.error) {
                    document.getElementById("successBlock").classList.add("d-none");
                    document.getElementById("errorBlock").classList.remove("d-none");
                } else {
                    document.getElementById("errorBlock").classList.add("d-none");
                    document.getElementById("successBlock").classList.remove("d-none");
                    getAccountDetails();
                }
            });
    }
}

getAccountDetails();