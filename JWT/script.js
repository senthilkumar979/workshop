async function getAccountDetails(token) {
    await fetch('http://localhost:8080/api/myaccount', {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
    }).then(res => res.json()).then(result => {
        if (result) {
            sessionStorage.setItem('userDetails', JSON.stringify(result));
        }
    });
}

async function login(event) {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    event.preventDefault();
    if (email.value && password.value) {
        await fetch('http://localhost:8080/api/authenticate', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            }),
        }).then(res => {
                const bearerToken = res.headers.get('Authorization');
                if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
                    const jwt = bearerToken.slice(7, bearerToken.length);
                    sessionStorage.setItem('token', jwt);
                }
                return res.json();
            }
        ).then(result => {
            if (result.error) {
                document.getElementById('successBlock').classList.add('d-none');
                document.getElementById('errorBlock').classList.remove('d-none');
            } else {
                document.getElementById('errorBlock').classList.add('d-none');
                document.getElementById('successBlock').classList.remove('d-none');
                getAccountDetails();
            }
        });
    }
}