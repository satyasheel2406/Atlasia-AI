import api from "../../utils/axios"

export const verifyBillingPayment = async (payload) => {
    try{
        const {data} = await api.post("/api/billing/verify", payload)
        return data
    }catch(error)
    {
        console.log(error)
        return null
    }
}
