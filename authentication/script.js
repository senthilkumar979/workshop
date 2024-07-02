async function login(event) {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    event.preventDefault();
    if (email.value && password.value) {
        await fetch('http://localhost:8080/api/authenticate', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        }).then(res => res.json()).then(result => {
            if (result.error) {
                document.getElementById('successBlock').classList.add('d-none');
                document.getElementById('errorBlock').classList.remove('d-none');
            } else {
                document.getElementById('errorBlock').classList.add('d-none');
                document.getElementById('successBlock').classList.remove('d-none');
            }
        });
    }
}