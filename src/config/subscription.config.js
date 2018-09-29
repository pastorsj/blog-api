import webpush from 'web-push';

webpush.setVapidDetails(
    'mailto:samjpastoriza@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default webpush;
