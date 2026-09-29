import axios from "axios"

//model ko photo IDs khud se sochne dena kaam nahi karta (broken links banti hain),
//isliye pehle Unsplash se asli, kaam karne wali image URLs le lo aur wahi prompt me daal do
export const searchImages = async (query, count = 6) => {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
        console.log("UNSPLASH_ACCESS_KEY set nahi hai, images ke bina generate ho raha hai")
        return []
    }

    try {
        const { data } = await axios.get("https://api.unsplash.com/search/photos", {
            params: { query, per_page: count, orientation: "landscape" },
            headers: { Authorization: `Client-ID ${accessKey}` }
        })

        return (data?.results || []).map((photo) => ({
            url: photo.urls.regular,
            alt: photo.alt_description || query
        }))
    } catch (error) {
        console.log("unsplash search error:", error.response?.data?.errors?.[0] || error.message)
        return []
    }
}
