
console.log('no code yet!')

const state =  { }

const peInit = n => state.name = n

const peUpdate = () => {
    for (div of document.getElementsByTagName("div")) {
        let pe = div.getAttribute('pe');
console.log('pe: ',pe)
        if (pe != null) {
            div.style.border = "3px solid orange"
            div.innerHTML = 'setting inner html - append image: ' + div.getAttribute('pename')
        }
    }
}