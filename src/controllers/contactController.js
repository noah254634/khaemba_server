import * as contactService from '../services/contactService.js';

export const submit = async (req, res) => {
  try {
    const message = await contactService.submitContact(req.body);
    res.status(201).json({
      success: true,
      message: "Message received. I'll get back to you shortly.",
      id: message._id,
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ success: false, error: err.message });
  }
};
