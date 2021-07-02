module.exports = {
    JWT_SECRET: 'realwave',
    azure: {
        account: 'realwave',
        key: 'XcNp+SHbHLFQAT1TuRMwhT+3GaqE15uwrRRHKME9VamsAy1gX4qQxkMmSi0p0MaVlWbhvpRYijVDwc7irop7qg==',
        container: 'realwavecamfeed-test'
    },
    IsDev: (process.env.NODE_ENV || 'development') == 'development',
    isLocal: false
};