const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Token ដែលអ្នកទទួលបានពី Bakong Open API
const BAKONG_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiYWQ1MzljYzdiMGQ2NDc2YiJ9LCJpYXQiOjE3ODk3NDQzNTAsImV4cCI6MTc5NzUyMDM1MH0.IpXiSeOI-Z_n9E-f6-rocnHPlCyvSKSb1_O-vi9uQVk";
const BAKONG_ACCOUNT = "mon_samnang@bkrt";

// API សម្រាប់បង្កើត KHQR តាមចំនួនទឹកប្រាក់ជាក់ស្តែង
app.post('/api/generate-qr', async (req, function(res) {
    const { amount, currency } = req.body; // currency: USD ឬ KHR
    
    try {
        // ហៅទៅកាន់ Bakong Open API เพื่อ生成 Dynamic KHQR
        const response = await axios.post('https://api-bakong.nbc.gov.kh/v1/generate_qr_and_md5', {
            account_id: BAKONG_ACCOUNT,
            amount: amount,
            currency: currency || "USD",
            description: "Topup Game - Bong Chet"
        }, {
            headers: {
                'Authorization': `Bearer ${BAKONG_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API សម្រាប់ឆែកផ្ទៀងផ្ទាត់ការបង់ប្រាក់ (Check Transaction by MD5)
app.post('/api/check-payment', async (req, res) => {
    const { md5 } = req.body;
    
    try {
        const response = await axios.post('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', {
            md5: md5
        }, {
            headers: {
                'Authorization': `Bearer ${BAKONG_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.response_code === 0) {
            // បង់ប្រាក់ជោគជ័យ! ទីនេះអ្នកអាចសរសេរកូដបន្ថែមដើម្បីបញ្ជូនពេជ្រចូលហ្គេមអតិថិជនស្វ័យប្រវត្តិ
            res.json({ success: true, message: "បង់ប្រាក់បានជោគជ័យ!", data: response.data.data });
        } else {
            res.json({ success: false, message: "មិនទាន់បានបង់ប្រាក់ ឬរកមិនឃើញប្រតិបត្តិការ។" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
