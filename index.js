const { Client, GatewayIntentBits, AuditLogEvent } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const cron = require('node-cron');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

// ─── الإعدادات والمتغيرات ───────────────────────────────────
const TOKEN = 'MTU1NDY3Mjc3MjcxNjY5NTU2Mg.GkmhmS.kvJK0DQ1ivaXcU-72Chg1MBnG2VY7I66D1vKhI';                 // توكين البوت
const GUILD_ID = '1476040143914795008';               // آيدي السيرفر
const TARGET_CHANNEL_ID = '1554675333251473448';   // آيدي الروم الصوتي
const PROTECTED_ROLE_ID = '1554648648468537345';     // آيدي الرول المحمي
const OWNER_ID = [
    '1554672772716695562',
    '1488220819669909616'
];              // الشخص الوحيد المعفي وله كامل الصلاحيات
// ────────────────────────────────────────────────────────────

// 1️⃣ دالة الاتصال بالروم الصوتي والبقاء فيه
function connectToVoiceChannel() {
    try {
        const channel = client.channels.cache.get(TARGET_CHANNEL_ID);
        if (!channel || !channel.isVoiceBased()) return;

        joinVoiceChannel({
            channelId: channel.id,
            guildId: GUILD_ID,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false
        });
    } catch (error) {
        console.error('⚠️ خطأ في الاتصال بالصوت:', error);
    }
}

// 2️⃣ دالة المعاقبة عند التعدي على الرول المحمي
async function punishExecutor(guild, executorId) {
    if (executorId === OWNER_ID || executorId === client.user.id) return false;

    try {
        const member = await guild.members.fetch(executorId).catch(() => null);
        if (!member || member.user.bot) return false;

        await member.timeout(60 * 1000, 'التعدي على الرول المحمي').catch(e => console.error('لم أتمكن من إعطاء Time Out:', e));

        await member.send('𝒎𝒕𝒛𝒊𝒅𝒄𝒉 𝒕𝒌𝒉𝒓𝒃 𝒉𝒃𝒃 𝒌𝒉𝒕𝒓𝒂 𝒋𝒂𝒚𝒂 𝒃𝒂𝒏').catch(() => console.log('الخاص مقفول عند العضو.'));
        return true;
    } catch (err) {
        console.error('⚠ خطأ أثناء تطبيق العقوبة:', err);
        return false;
    }
}

// 3️⃣ عند تشغيل البوت
client.once('ready', async () => {
    console.log(`🤖 البوت يعمل بنجاح باسم: ${client.user.tag}`);
    
    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
        await guild.members.fetch().catch(() => console.log('تعذر جلب جميع الأعضاء'));
    }

    connectToVoiceChannel();
    setInterval(() => {
        const connection = getVoiceConnection(GUILD_ID);
        if (!connection || connection.joinConfig.channelId !== TARGET_CHANNEL_ID) {
            connectToVoiceChannel();
        }
    }, 10000);

    // 📩 إرسال رسالة الترحيب
    if (guild) {
        const role = await guild.roles.fetch(PROTECTED_ROLE_ID).catch(() => null);
        if (role) {
            const welcomeMessage = "𝒎𝒂𝒓𝒉𝒃𝒂 𝒃𝒊𝒌 𝒇 𝑵𝑶𝑺𝑻𝑨𝑳𝑮𝑰𝑨 𝑪𝑳𝑼𝑩";
            role.members.forEach(async (member) => {
                if (!member.user.bot) {
                    await member.send(welcomeMessage).catch(() => console.log(`تعذر إرسال رسالة التشغيل لـ ${member.user.tag}`));
                }
            });
        }
    }

    // ⏰ أذكار النوم (12:00 ليلاً)
    cron.schedule('0 0 * * *', async () => {
        const currentGuild = client.guilds.cache.get(GUILD_ID);
        if (!currentGuild) return;

        const role = await currentGuild.roles.fetch(PROTECTED_ROLE_ID).catch(() => null);
        if (!role) return;

        const sleepAzkar = `🌙 **تصبح على خير! أذكار النوم:**\n\n- باسمِكَ ربِّي وضعتُ جنبي وبِكَ أرفعُهُ، إن أمسَكْتَ نفسي فارحمْها، وإن أرسلْتَها فاحفظْها بما تحفظُ به عبادَكَ الصالحين.\n- قراءة آية الكرسي والمعوذتين.`;

        role.members.forEach(async (member) => {
            if (!member.user.bot) {
                await member.send(sleepAzkar).catch(() => console.log(`تعذر إرسال أذكار النوم لـ ${member.user.tag}`));
            }
        });
    });

    // ⏰ أذكار الصباح (08:00 صباحاً)
    cron.schedule('0 8 * * *', async () => {
        const currentGuild = client.guilds.cache.get(GUILD_ID);
        if (!currentGuild) return;

        const role = await currentGuild.roles.fetch(PROTECTED_ROLE_ID).catch(() => null);
        if (!role) return;

        const morningAzkar = `☀️ **صباح الخير! أذكار الصباح:**\n\n- أصْبَحْنَا وَأصْبَحَ المُلْكُ للَّهِ، وَالحَمْدُ للَّهِ لا إلَهَ إلَّا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ.\n- أظْهِرِ الشُّكْرَ وَاسْتَعِنْ بِاللَّهِ فِي يَوْمِك كُلِّهِ.`;

        role.members.forEach(async (member) => {
            if (!member.user.bot) {
                await member.send(morningAzkar).catch(() => console.log(`تعذر إرسال أذكار الصباح لـ ${member.user.tag}`));
            }
        });
    });

    // ⏰ تذكير كل 5 ساعات
    cron.schedule('0 */5 * * *', async () => {
        const currentGuild = client.guilds.cache.get(GUILD_ID);
        if (!currentGuild) return;

        const role = await currentGuild.roles.fetch(PROTECTED_ROLE_ID).catch(() => null);
        if (!role) return;

        const clanMessage = "𝑨𝑹𝑾𝑨𝑯 𝑳 𝑵𝑶𝑺𝑻𝑨𝑳𝑮𝑰𝑨 𝑪𝑳𝑼𝑩 𝑵𝑮𝑺𝑹𝑶 𝑯𝑩𝑩";

        role.members.forEach(async (member) => {
            if (!member.user.bot) {
                await member.send(clanMessage).catch(() => console.log(`تعذر إرسال التذكير لـ ${member.user.tag}`));
            }
        });
    });
});

// 4️⃣ طرد الغرباء فقط واستثناء حاملي الرول المخصص والمالك
client.on('voiceStateUpdate', async (oldState, newState) => {
    // إعادة البوت للروم إذا تم إخراجه
    if (newState.id === client.user.id) {
        if (!newState.channelId || newState.channelId !== TARGET_CHANNEL_ID) {
            setTimeout(() => connectToVoiceChannel(), 2000);
        }
        return;
    }

    // فحص إذا دخل شخص ما إلى الروم المحدد
    if (newState.channelId === TARGET_CHANNEL_ID) {
        const member = newState.member;
        if (!member) return;

        // 🟢 المستثنون من الطرد: المالك - حاملو الرول المحمي - البوتات
        const hasProtectedRole = member.roles.cache.has(PROTECTED_ROLE_ID);
        const isOwner = member.id === OWNER_ID;

        if (hasProtectedRole || isOwner || member.user.bot) {
            return; // السماح لهم بالبقاء في الروم
        }

        try {
            // 🔴 طرد باقي الأعضاء (فصل من الصوت)
            await newState.disconnect();
            console.log(`🚫 تم طرد ${member.user.tag} من الروم الصوتي لعدم امتلاكه الرول المخصص.`);
            
            await member.send('𝒎𝒕𝟑𝒂𝒘𝒅𝒄𝒉 𝒕𝒅𝒌𝒉𝒍 𝒉𝒃𝒃 𝒈𝒉𝒊𝒓 𝒏𝒐𝒔𝒕𝒂𝒍𝒈𝒊𝒂 𝒉𝒏𝒂').catch(() => null);
        } catch (err) {
            console.error(`⚠️ تعذر طرد ${member.user.tag} من الصوت:`, err);
        }
    }
});

// 5️⃣ حماية الرول عند التعديل
client.on('roleUpdate', async (oldRole, newRole) => {
    if (newRole.id !== PROTECTED_ROLE_ID) return;

    if (
        oldRole.name !== newRole.name ||
        oldRole.permissions.bitfield !== newRole.permissions.bitfield ||
        oldRole.position !== newRole.position ||
        oldRole.color !== newRole.color
    ) {
        const fetchedLogs = await newRole.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent?.RoleUpdate }).catch(() => null);
        const log = fetchedLogs?.entries.first();
        const executorId = log?.executor?.id;

        if (executorId === OWNER_ID) return;

        await newRole.edit({
            name: oldRole.name,
            permissions: oldRole.permissions,
            position: oldRole.position,
            color: oldRole.color
        }).catch(console.error);

        if (executorId) {
            await punishExecutor(newRole.guild, executorId);
        }
    }
});

// 6️⃣ حماية الرول عند الحذف
client.on('roleDelete', async (role) => {
    if (role.id !== PROTECTED_ROLE_ID) return;

    const fetchedLogs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent?.RoleDelete }).catch(() => null);
    const log = fetchedLogs?.entries.first();
    const executorId = log?.executor?.id;

    await role.guild.roles.create({
        name: role.name,
        color: role.color,
        permissions: role.permissions,
        reason: 'إعادة إنشاء الرول المحمي تلقائياً'
    }).catch(console.error);

    if (executorId && executorId !== OWNER_ID) {
        await punishExecutor(role.guild, executorId);
    }
});

// 7️⃣ حماية الرول عند إعطائه أو إزالته من الأعضاء
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const hadRole = oldMember.roles.cache.has(PROTECTED_ROLE_ID);
    const hasRole = newMember.roles.cache.has(PROTECTED_ROLE_ID);

    if (hadRole !== hasRole) {
        const fetchedLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent?.MemberRoleUpdate }).catch(() => null);
        const log = fetchedLogs?.entries.first();
        const executorId = log?.executor?.id;

        if (executorId === OWNER_ID) return;

        if (hasRole) {
            await newMember.roles.remove(PROTECTED_ROLE_ID).catch(console.error);
        } else {
            await newMember.roles.add(PROTECTED_ROLE_ID).catch(console.error);
        }

        if (executorId) {
            await punishExecutor(newMember.guild, executorId);
        }
    }
});

client.login(TOKEN);