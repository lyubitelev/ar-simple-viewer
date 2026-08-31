

const  conf =
{
    idsFolder: "dev",
    awsRegion: "ru-central1",
    awsEndPoint: "https://storage.yandexcloud.net",
    awsAccessKeyId: "YCAJEVnmBMO0Q_qVm5co7-GiY",
    awsSecretAccessKey: "YCNGaNsZH8KZHhNIGWdBBIWpXzjn_cFJrQT0z3qi",
    // Публичный HTTPS-адрес BackgroundSupportApi. Пока backend не развёрнут — null,
    // и формы заявок честно показывают ошибку. См. docs/deployment/lead-backend.md.
    // Учётные данные SMTP-провайдера живут только на backend.
    supportApiUrl: null
}
export default conf;
