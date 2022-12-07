
function PEstate() {
  this.s = 'start',
  this.e = '',
  this.title = '',
  this.text = '',
  this.finalize = null,
  this.html = ''
}

const peEndState = s => { // depending on state.s, finish  // 
  // if (state.e == 'ended') { so, far, this do-nothing can be ignored, rest of algo does-nothing if 'ended'
  //  console.log('shhh... ended')
  //  return
  //}
  if (s.finalize) {
    s = s.finalize(s)
  }
  
  //console.log('endstate: ', s.s, '... now ended')
  s.s = 'ended'
  s.finalize = null
  return s
}

const peTitle = (s,l) => { 
  s.title = l.split('"')[1]
  s.url = l.split(/\s+/).slice(-2)[0]
  s.titlePic = l.split(/\s+/).slice(-1)[0]
  s.titleUrl = `${s.url}/${s.titlePic}`
  //console.log('peTitle: ', s.title, '  url: ', s.titleUrl, '  photo: ',s.titlePic)
  let h = `<div class="peTitle" style="background-image: url(\'${s.titleUrl}\');">\n`
  h += `<h1> ${s.title} </h1>\n`
  h += '</div>\n\n'
  s.html += h
  s = peEndState(s) // now finish
  return s
}

const peEndTitle = (s,l) => { 
  s.endPic = l.split(/\s+/)[1]
  s.endUrl = `${s.url}/${s.endPic}`
  let h = `<div class="peEndTitle" style="background-image: url(\'${s.endUrl}\');">\n`
  h += '&nbsp; </div>\n\n'
  s.html += h
  return s 
}


const peText_finalize = s => {
  if (s.s2 == 'maybePhotoCaption') { // hit this immediately after pePhoto
    s = pePhoto_finalize(s) // photo and add the caption
    s.s2 = null
    return s
  }
  // else it is normal text
  let h = '<div class="peText">\n' 
  const mtext = s.text.join('\n')
  h += window.marked.parse(mtext)
  h += '\n</div>\n\n'
  s.finalize = null
  //console.log('pet final: ', s)  
  s.html += h
  return s
}

const peText = (s,l) => {
  if (s.s == 'ended') { // nice, clean start to div text
    s.s = 'getting text'
    s.finalize = peText_finalize
    s.text = []
  }
  if (s.s == 'getting text') {
      s.text.push(l)
  }
  return s
}

const pePhoto_finalize = s => {
  s.html += `<div class="pePhoto"> <img src=${s.photoUrl}/> </div>\n`
  s.html += `<p class="pePhoto"> photo caption:  ${s.text.join('n')} </p>\n`
  s.finalize = null
  s.text = []
  s.state = ''
  return s
}

const pePhoto = (s,l) => { 
  //console.log('pePhoto: ',l)
  const p = l.split(/\s+/)[1]
  s.photoUrl = `S3url.../${s.folder}/${p}`
  s.photoCaption = 'no caption yet'
  s.s2 = 'maybePhotoCaption'  // ?? maybe 'gettingCaption' to mimic getting text ?
  return s
}

const pePhotoThumbs = (s,l) => {   // _pePhotoThumbs   p1.jpg ??short captio?? p2.jpg short caption
  const p = l.split(/\s+/)[1]
  let h = '<div>'
  h += `<img src="${s.url}/${p}" height=180px />`
  h += '</div>'
  s.html += h
  return s 
}

const pePhotoCarousel = (s,l) => { return s }
const peSidePic = (s,l) => { return s }  // like pePhoto, but with immedate text the side text, rest of line is pic caption

const peFuncs = { peEndState, peTitle, peText, pePhoto, pePhotoThumbs, pePhotoCarousel, peSidePic, peEndTitle }

const removeComments = s => s.replace(/_peComment.*?_peCommentEnd/sg,'')
  // ? find first (non-greedy) comment end;  s - dot includes newlines

const peParse = peText => {
  const lArray = removeComments(peText).split('\n').map(s => s.trim())
  let s = new PEstate()

  lArray.forEach( l => {
    let f = l.split(/\s+/)[0] 
    if (l == '') {
      f = 'peEndState'
    } else if (f.substring(0,3)=='_pe') {
        f = f.substring(1)
        if (! (f in peFuncs) ) {
          console.error('cant find peFuncs ',f)
          process.exit(1)
        }
    } else {
      f = 'peText'
    }
    s = peFuncs[f](s,l) // run the function
  })
  return s
}

const peInit = async (peFile, divTag) => {
  const divEl = document.getElementById(divTag) // TODO: check for existence

  const headers = {'Content-Type': 'text/plain'}
  const peText = await fetch(peFile, { headers } ).then( r => r.text() ).catch(`can't fetch ${peFile}`)

  const peLines = peText
  const peParsed = peParse(peLines)
  divEl.innerHTML = peParsed.html

}

export { peInit, peParse }
