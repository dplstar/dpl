const viewer = document.getElementById('cert-viewer')
const viewerImage = viewer.querySelector('.cert-viewer-body img')

document.querySelectorAll('[data-cert-open]').forEach((button) => {
  button.addEventListener('click', () => {
    viewer.showModal()
    document.documentElement.classList.add('cert-lock')
  })
})

document.querySelector('[data-cert-close]').addEventListener('click', () => viewer.close())

viewer.addEventListener('click', (event) => {
  if (event.target === viewer) viewer.close()
})

viewer.addEventListener('close', () => {
  document.documentElement.classList.remove('cert-lock')
  viewerImage.classList.remove('is-zoomed')
})

viewerImage.addEventListener('click', () => {
  viewerImage.classList.toggle('is-zoomed')
})
