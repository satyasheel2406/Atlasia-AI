import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { Check, Crown, Loader2, Sparkles, X, Zap } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createBillingOrder } from '../features/createBillingOrder'
import { verifyBillingPayment } from '../features/verifyBillingPayment'
import { loadRazorpayScript } from '../../utils/loadRazorpay'
import getCurrentUser from '../features/getCurrentUser'
import { setUserdata } from '../redux/userSlice'

//PLANS.js (billing service) ke real values yahan mirror kiye hain — koi GET endpoint
//nahi hai jo plans list return kare, isliye abhi ke liye yahi source of truth hai
const UPGRADE_PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: 199,
        credits: 500,
        validity: 30,
        icon: Sparkles,
        highlight: "Good for regular use",
    },
    {
        id: "pro",
        name: "Pro",
        price: 499,
        credits: 1000,
        validity: 30,
        icon: Crown,
        highlight: "Best for power users",
    },
]

//free < starter < pro — isse pata chalta hai click "upgrade" hai, "renew" hai, ya
//neeche ka plan (jo allow nahi karna chahiye, warna paise dekar kam credits milenge)
const PLAN_RANK = { free: 0, starter: 1, pro: 2 }

function PlanCard({ plan, userData, onUpgraded }) {
    const [status, setStatus] = useState("idle")
    const Icon = plan.icon

    const currentRank = PLAN_RANK[userData?.plan] ?? 0
    const planRank = PLAN_RANK[plan.id] ?? 0
    const isLower = planRank < currentRank
    const isSame = planRank === currentRank

    const idleLabel = isSame ? "Renew" : "Upgrade"
    const statusLabel = {
        idle: idleLabel,
        ordering: "Creating order...",
        paying: "Waiting for payment...",
        verifying: "Verifying payment...",
        done: isSame ? "Renewed" : "Upgraded",
        error: "Try again",
    }

    const handleUpgrade = async () => {
        setStatus("ordering")
        const orderData = await createBillingOrder(plan.id)
        if(!orderData?.order){
            setStatus("error")
            return
        }
       
        const scriptOk = await loadRazorpayScript()
        if(!scriptOk){
            setStatus("error")
            return
        }

        setStatus("paying")

        const razorpay = new window.Razorpay({
            key: orderData.key,
            amount: orderData.order.amount,
            currency: orderData.order.currency,
            order_id: orderData.order.id,
            name: "AtlasiaAI",
            description: `${plan.name} Plan — ${plan.credits} credits`,
            prefill: {
                name: userData?.name,
                email: userData?.email,
            },
            theme: { color: "#6366f1" },
            handler: async (response) => {
                setStatus("verifying")
                const verifyData = await verifyBillingPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                })

                if(verifyData?.message === "Payment Verified"){
                    setStatus("done")
                    onUpgraded?.()
                } else {
                    setStatus("error")
                }
            },
            modal: {
                //user ne popup band kar diya bina pay kiye — wapas idle par le aao
                ondismiss: () => setStatus((s) => (s === "paying" ? "idle" : s)),
            },
        })

        razorpay.on("payment.failed", () => setStatus("error"))
        razorpay.open()
    }

    return (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Icon size={15} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-[13.5px] font-semibold text-slate-100">{plan.name}</p>
                            {isSame && (
                                <span className="text-[9.5px] font-semibold uppercase tracking-wide text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full">
                                    Current
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-500">{plan.highlight}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[15px] font-bold text-slate-100">₹{plan.price}</p>
                    <p className="text-[10.5px] text-slate-500">/ {plan.validity} days</p>
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                <Check size={13} className="text-emerald-400 shrink-0" />
                {plan.credits} AI credits
            </div>

            {isLower ? (
                <div className="w-full flex items-center justify-center py-2 rounded-lg text-[13px] font-medium bg-white/[0.03] text-slate-500 border border-white/[0.06]">
                    Included in your {userData?.plan} plan
                </div>
            ) : (
                <>
                    <button
                        onClick={handleUpgrade}
                        disabled={!["idle", "error"].includes(status)}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium border-none transition-all duration-150 ${
                            status === "done"
                                ? "bg-emerald-500/15 text-emerald-400 cursor-default"
                                : "bg-gradient-to-br from-indigo-500 to-violet-700 text-white hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        }`}
                    >
                        {!["idle", "done", "error"].includes(status) && <Loader2 size={14} className="animate-spin" />}
                        {statusLabel[status]}
                    </button>

                    {status === "error" && (
                        <p className="text-[11px] text-rose-400 -mt-1">Something went wrong. Please try again.</p>
                    )}
                </>
            )}
        </div>
    )
}

function BillingDrawer({open,onClose}) {
    const dispatch = useDispatch()
    const { userData } = useSelector((state) => state.user)

    const plan = userData?.plan || "free"
    const credits = userData?.credits ?? 0
    const totalCredits = userData?.totalCredits || 100
    const usedPct = Math.min(100, Math.round(((totalCredits - credits) / totalCredits) * 100))
    const planExpiresAt = userData?.planExpiresAt

    const refreshUser = async () => {
        const fresh = await getCurrentUser()
        if(fresh) dispatch(setUserdata(fresh))
    }

    return (
        <AnimatePresence>
        {open && <> <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: .5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
        />
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: .25 }}
            className="fixed right-0 top-0 z-50 h-screen w-full sm:w-[388px] bg-[#0f1117] border-l border-white/10 shadow-2xl flex flex-col"
        >

        <div className='flex items-center justify-between p-5 border-b border-white/10'>
            <div>
                <div className='text-[15px] font-semibold text-slate-100 tracking-tight'>
                Billing
            </div>
            <div className='text-[12px] text-slate-500 mt-0.5'>
                Plans & Credits
            </div>
            </div>

           <button
             onClick={onClose}
             className='flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-500 cursor-pointer hover:bg-white/[0.06] hover:text-slate-200 transition-colors duration-150'
           >
             <X size={16}/>
           </button>
        </div>

        <div className='flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>

            <div className='rounded-xl border border-white/[0.08] bg-gradient-to-br from-indigo-500/10 to-violet-700/10 p-4 flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1.5'>
                        <Zap size={14} className='text-indigo-400' />
                        <span className='text-[13px] font-semibold text-slate-100 capitalize'>{plan} Plan</span>
                    </div>
                    {planExpiresAt && (
                        <span className='text-[10.5px] text-slate-500'>
                            Renews {new Date(planExpiresAt).toLocaleDateString()}
                        </span>
                    )}
                </div>

                <div>
                    <div className='flex items-center justify-between mb-1.5'>
                        <span className='text-[11.5px] text-slate-400'>Credits remaining</span>
                        <span className='text-[11.5px] font-medium text-slate-200'>{credits} / {totalCredits}</span>
                    </div>
                    <div className='h-1.5 rounded-full bg-white/[0.06] overflow-hidden'>
                        <div
                            className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300'
                            style={{ width: `${100 - usedPct}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className='flex flex-col gap-3'>
                <p className='text-[10.5px] font-semibold uppercase text-slate-500 tracking-widest'>
                    Upgrade your plan
                </p>
                {UPGRADE_PLANS.map((p) => (
                    <PlanCard key={p.id} plan={p} userData={userData} onUpgraded={refreshUser} />
                ))}
            </div>

        </div>

        <div className='px-5 py-3.5 border-t border-white/10 text-center'>
            <p className='text-[10.5px] text-slate-600'>Secure payments powered by Razorpay</p>
        </div>

        </motion.div>
        </>
        }

        </AnimatePresence>
    )
}

export default BillingDrawer
