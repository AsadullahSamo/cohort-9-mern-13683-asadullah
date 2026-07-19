const jwt = require("jsonwebtoken")

const authorize = (req, res, next) => {
    const header = req.headers.authorization

    if(!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Not authorized" })
    }

    const token = header.split(" ")[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        req.userId = payload.sub
        next()
    } catch {
        res.status(401).json({ error: "Invalid or expired token" })
    }
}

module.exports = authorize