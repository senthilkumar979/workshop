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
        sessionStorage.setItem('email', email.value);

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
            if (result.error === 'missing_totp' && result.secretQrCode) {
                document.getElementById('errorBlock').classList.add('d-none');
                document.getElementById('loginBlock').classList.add('d-none');
                document.getElementById('qrBlock').classList.remove('d-none');
                const element = document.createElement("img");
                element.setAttribute("src", result.secretQrCode);
                element.setAttribute("height", "150");
                element.setAttribute("width", "150");
                element.setAttribute("alt", "qr-code");
                listenToOtpChange();
                document.getElementById("qrCode").appendChild(element);
            } else if (result.error === 'totp_verification_required') {
                document.getElementById('errorBlock').classList.add('d-none');
                document.getElementById('loginBlock').classList.add('d-none');
                document.getElementById('qrBlock').classList.add('d-none');
                document.getElementById('otpBlock').classList.remove('d-none');
                listenToOtpChange();
            } else {
                document.getElementById('errorBlock').classList.remove('d-none');
            }
        });
    }
}


function listenToOtpChange() {
    const inputs = document.querySelectorAll(".otp-field > input");
    inputs.forEach((input, index1) => {
        input.addEventListener("keyup", (e) => {
            const values = [];
            inputs.forEach(otpInput => {
                if (otpInput.value && !isNaN(Number(otpInput.value))) {
                    values.push(Number(otpInput.value));
                }
            });

            if (values?.length === 6) {
                submitOtp(values.join(''));
            }
        });
    });
}

async function submitOtp(otp) {
    const email = sessionStorage.getItem('email');
    await fetch('http://localhost:8080/api/verify-otp', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            otp
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
        if (result.error === 'Invalid OTP code') {
            document.getElementById('invalidOTPBlock').classList.remove('d-none');
        } else {
            getAccountDetails();
            document.getElementById('invalidOTPBlock').classList.add('d-none');
            document.getElementById('otpBlock').classList.add('d-none');
            document.getElementById('qrBlock').classList.add('d-none');
            document.getElementById('successBlock').classList.remove('d-none');
        }
    });
}