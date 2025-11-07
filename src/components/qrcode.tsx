import QRCode from 'qrcode'

// With promises
// QRCode.toDataURL()
//     .then(url => {
//         console.log(url)
//     })
//     .catch(err => {
//         console.error(err)
//     })

// With async/await
export const generateQR = async (text: any) => {
    try {
        console.log(await QRCode.toDataURL(text))
        return await QRCode.toDataURL(text);
    } catch (err) {
        console.error(err)
    }
}