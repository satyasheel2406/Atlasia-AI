//script sirf ek baar load ho, baar baar drawer khulne par dobara inject na ho
let loadingPromise = null

export const loadRazorpayScript = () => {
    if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(true)
    if (loadingPromise) return loadingPromise

    loadingPromise = new Promise((resolve) => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => resolve(true)
        script.onerror = () => {
            loadingPromise = null
            resolve(false)
        }
        document.body.appendChild(script)
    })

    return loadingPromise
}
