function login(){
    console.log(document.getElementById("password-field").value)
    fetch("./auth", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"password":document.getElementById("password-field").value})
    })
    .then(response=>{
        return response.json()
    })
    .then(data=>{
        console.log(data)
        if (data.login == true){
            window.location.replace(`./${data.name}`);
        }
    })
}
