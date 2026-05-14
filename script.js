console.log("kya bolti h public?");

async function main(){
    let a = await fetch(`./songs/${artist} /info.json`);
    let response = await a.text();
    console.log(response);
    let element = document.createElement("div");
    let div = document.createElement("div");
    div.innerHTML = response;
    element.appendChild(div);
    document.body.appendChild(element);
}