const Discord = require("discord.js");
const client = new Discord.Client();

const config = require ('./config.json')
const command = require ('./comandos')
const welcome = require ('./bienvenida')
const encuesta = require ('./comandos/comandos/encuesta')
const mongo = require ('./mongo')

client.on("ready", async () => {
    console.log("Intervin... On the track!");
    
  await mongo().then((mongoose) => {
    try {
      console.log('Conectado a Mongo!')
    } finally {
      mongoose.connection.close()
    }
  })

  encuesta(client) 


  command(client, 'miembros', (message) => {
    client.guilds.cache.forEach((guild) => {
        message.channel.send(
            `**${guild.name}** tiene un total de **${guild.memberCount}** miembros`
        )
    })
  })
  command(client, 'limpiar',(message) => {
      if (message.member.hasPermission('ADMINISTRATOR')) {
          message.channel.messages.fetch().then((resultados) => {
              message.channel.bulkDelete(resultados)
              message.channel.send('Mensajes borrados con éxito!') .then 
                message.delete()
            })
        }
        if (!message.member.permissions.has('ADMINISTRATOR')) {
         return message.channel.send('No tienes permisos suficientes como para ejecutar ese comando!') 
        }        
     })

   command(client, 'estado', (message) => {
    const content = message.content.replace('>estado ', '')
    client.user.setPresence({
      activity: {
        name: content,
        type: 0,
       },
     })
   }) 

   command(client, 'info', (message) => {
    const { guild } = message

    const { name, region, memberCount, owner, afkTimeout } = guild
    const icon = guild.iconURL()

    const embed = new Discord.MessageEmbed()
      .setTitle(`Información de "${name}"`)
      .setThumbnail(icon)
      .setColor('#030244')
      .addFields(
        {
          name: 'Region',
          value: region,
        },
        {
          name: 'Miembros',
          value: memberCount,
        },
        {
          name: 'Propietario',
          value: owner.user.tag,
        },
        {
          name: 'Tiempo AFK',
          value: afkTimeout / 60,
        }
      )

    message.channel.send(embed)
  })
})

    command(client, 'ayuda', (message) => {
        const logo =
          'https://i.imgur.com/IR9m7li.jpg'
    
        const embed = new Discord.MessageEmbed()
          .setTitle('Lista de comandos de Intervin')
          .setURL('https://www.toolsfordiscord.com')
          .setAuthor(message.author.username)
          .setThumbnail(logo)
          .setFooter('v0.1 | Todos los derechos reservados a Assori#5498')
          .setColor('#030244')
          .addFields(
            {
              name: '>miembros',
              value: 'Te dice el número de miembros de tu servidor.',
              inline: false,
            },
            {
              name: '>limpiar',
              value: '(Solo administradores!) Borra los últimos 50 mensajes del canal.',
              inline: false,
            },
            {
              name: '>info',
              value: 'Información bascia del servidor!',
              inline: false,
            },
            {
              name: '>bienvenida',
              value: 'Configura tu mensaje de bienvenida!',
              inline: false,
            },
            {
              name: '>encuesta',
              value: 'Convierte tu último mensaje en una encuesta! El bot reaccionará a ese mensaje con: 👍 y 👎',
              inline: false,
            },
          )
          
        message.channel.send(embed)
      })
      welcome(client)

      command(client, 'ban', (message) => {
        const { member, mentions } = message
    
        const tag = `<@${member.id}>`
    
        if (
          member.hasPermission('ADMINISTRATOR') ||
          member.hasPermission('BAN_MEMBERS')
        ) {
          const target = mentions.users.first()
          if (target) {
            const targetMember = message.guild.members.cache.get(target.id)
            targetMember.ban()
            message.channel.send(`El administrador ${tag} ha baneo completado con éxito!`)
          } else {
            message.channel.send(`${tag} Menciona al usuario al que quieras banear!`)
          }
        } else {
          message.channel.send(
            `${tag} No tienes permisos suficientes para ejecutar este comando!`
          )
        }
      })
      command(client, 'kick', (message) => {
        const { member, mentions } = message
    
        const tag = `<@${member.id}>`
    
        if (
          member.hasPermission('ADMINISTRATOR') ||
          member.hasPermission('KICK_MEMBERS')
        ) {
          const target = mentions.users.first()
          if (target) {
            const targetMember = message.guild.members.cache.get(target.id)
            targetMember.kick()
            message.channel.send(`El administrador ${tag} lo ha expulsado exitosamente.`)
          } else {
            message.channel.send(`${tag} Menciona al usuario al que quieras kickear`)
          }
        } else {
          message.channel.send(
            `${tag} No tienes permisos suficientes como para ejecutar ese comando.`
          )
        }
      })    
    
 client.login(config.token);