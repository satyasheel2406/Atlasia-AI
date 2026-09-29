import api from "../../utils/axios"

export const createBillingOrder = async (plan) => {
    try{
        const {data} = await api.post("/api/billing/create", { plan })
        return data
    }catch(error)
    {
        console.log(error)
        return null
    }
}
