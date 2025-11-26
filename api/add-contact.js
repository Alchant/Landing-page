const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, listId, listType } = req.body;

  if (!email || !listId) {
    return res.status(400).json({ error: 'Email and listId are required' });
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  if (!SENDGRID_API_KEY) {
    return res.status(500).json({ error: 'SendGrid API key not configured' });
  }

  // Step 1: Add contact to list
  const contactData = {
    list_ids: [listId],
    contacts: [
      {
        email: email
      }
    ]
  };

  try {
    // Add contact to list
    const contactResponse = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    const contactResult = await contactResponse.json();

    if (!contactResponse.ok) {
      return res.status(contactResponse.status).json({ 
        success: false, 
        error: contactResult 
      });
    }

    // Step 2: Send confirmation email
    const welcomeMessage = listType === 'creator' 
      ? 'Bun venit în comunitatea noastră de creatori! Ești gata să-ți împărtășești creațiile autentice cu lume.'
      : 'Bun venit! Ești gata să descoperi produse unice create cu pasiune de meșteșugari autentici.';

    const emailData = {
      personalizations: [
        {
          to: [{ email: email }],
          subject: 'Bun venit la Ioty.ro! 🎉'
        }
      ],
      from: {
        email: 'noreply@ioty.ro',
        name: 'Ioty.ro'
      },
      content: [
        {
          type: 'text/html',
          value: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Montserrat', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
                h1 { color: #ff7500; font-size: 28px; margin-bottom: 20px; }
                p { color: #333; font-size: 16px; line-height: 1.6; }
                .button { display: inline-block; padding: 15px 30px; background-color: #e07515; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Bun venit la Ioty.ro!</h1>
                <p>${welcomeMessage}</p>
                <p>Te-ai abonat cu succes la newsletter-ul nostru. Vei fi primul care află despre:</p>
                <ul>
                  <li>Creatori noi și povești inspiraționale</li>
                  <li>Produse unice și oferte exclusive</li>
                  <li>Evenimente și workshop-uri</li>
                  <li>Noutăți din comunitatea noastră</li>
                </ul>
                <p>Site-ul nostru va fi lansat în curând. Rămâi pe fază!</p>
                <div class="footer">
                  <p>Cu drag,<br>Echipa Ioty.ro</p>
                  <p style="font-size: 12px; color: #999;">Dacă nu te-ai abonat la acest newsletter, te rugăm să ignori acest email.</p>
                </div>
              </div>
            </body>
            </html>
          `
        }
      ]
    };

    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (emailResponse.ok) {
      return res.status(200).json({ 
        success: true, 
        message: 'Contact added and confirmation email sent' 
      });
    } else {
      // Contact added but email failed - still return success
      return res.status(200).json({ 
        success: true, 
        message: 'Contact added successfully' 
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
