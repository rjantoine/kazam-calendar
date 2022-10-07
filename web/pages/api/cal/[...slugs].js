import sanityClient from "@sanity/client"
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
    const {slugs: [calendar, code]} = req.query

    const client = sanityClient({
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_DATASET,
        apiVersion: '2021-03-25', // use current UTC date - see "specifying API version"!
        token: process.env.SANITY_TOKEN, // or leave blank for unauthenticated usage
        useCdn: false, // `false` if you want to ensure fresh data
    })

    const sharedCalendar = await client.fetch('*[_type == "sharedCalendar" && slug.current == $calendar][0]{calendarLink, "codes": array::compact(shareLinks[].link)}', {calendar}) || []

    if(!sharedCalendar.codes.includes(code)) res.status(500).send({message: 'Access denied.'})

    const calRes = await fetch('https://www.airbnb.ca/calendar/ical/705521568481310146.ics?s=aba76924042068194c60c7168ac7d8b4')
    res.setHeader('Content-Type', 'text/calendar').status(200).send(calRes.body)

    // const calRes = await fetch('https://www.airbnb.ca/calendar/ical/705521568481310146.ics?s=aba76924042068194c60c7168ac7d8b4')
    // res.status(200).send()
}
