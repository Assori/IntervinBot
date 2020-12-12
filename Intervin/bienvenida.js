const mongo = require('./mongo')
const command = require('./comandos')
const welcomeSchema = require('./esquemas/esquema-bienvenida')

module.exports = (client) => {

  const cache = {}

  command(client, 'bienvenida', async (message) => {
    const { member, channel, content, guild } = message

    if (!member.hasPermission('ADMINISTRATOR')) {
      channel.send('No tienes permisos suficientes como para ejecutar ese comando.')
      return
    }

    let text = content

    const split = text.split(' ')

    if (split.length < 2) {
      channel.send('Vamos a configurar las bienvenidas personalizadas en tu servidor! Sigue estos pasos: deberás escribir los comandos en el canal en el que quieres que aparezcan las bienvenidas. Pondrás >bienvenida de nuevo y después tu mensaje de bienvenida personalizado. Para mencionar al usuario nuevo, pon <@>. Una vez hayas terminado utilizado el comando >testbienvenida para ver como quedaría, ¡suerte!')
      return
    }

    split.shift()
    text = split.join(' ')

    cache[guild.id] = [channel.id, text]

    await mongo().then(async (mongoose) => {
      try {
        await welcomeSchema.findOneAndUpdate(
          {
            _id: guild.id,
          },
          {
            _id: guild.id,
            channelId: channel.id,
            text,
          },
          {
            upsert: true,
          }
        )
      } finally {
        mongoose.connection.close()
      }
    })
  })

  const onJoin = async (member) => {
    const { guild } = member

    let data = cache[guild.id]

    if (!data) {
      console.log('Buscando en la base de datos...')

      await mongo().then(async (mongoose) => {
        try {
          const result = await welcomeSchema.findOne({ _id: guild.id })

          cache[guild.id] = data = [result.channelId, result.text]
        } finally {
          mongoose.connection.close()
        }
      })
    }

    const channelId = data[0]
    const text = data[1]

    const channel = guild.channels.cache.get(channelId)
    channel.send(text.replace(/<@>/g, `<@${member.id}>`))
  }

  command(client, 'testbienvenida', (message) => {
    onJoin(message.member)
  })

  client.on('guildMemberAdd', (member) => {
    onJoin(member)
  })
}