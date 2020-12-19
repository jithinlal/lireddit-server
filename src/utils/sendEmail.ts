'use strict';
import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
	// let testAccount = await nodemailer.createTestAccount();
	// console.log(testAccount);
	let transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: 'p5ranlnid3srllkc@ethereal.email', // generated ethereal user
			pass: 'aEskCUvURC8TVD27tZ', // generated ethereal password
		},
	});
	let info = await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>',
		to,
		subject: 'Change Password',
		html,
	});
	console.log('Message sent: %s', info.messageId);
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
