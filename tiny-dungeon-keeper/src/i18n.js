/**
 * Translations. English text is the key; each entry lists
 * [Español, Português, Français, Deutsch, Русский, Türkçe, Bahasa Indonesia].
 * Missing entries fall back to English. {name} style placeholders are filled by t().
 */
import { kv } from './storage.js';
export const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'id', name: 'Bahasa Indonesia' },
];

const D = {
  // keeper
  "Too easy!": ["¡Demasiado fácil!", "Fácil demais!", "Trop facile !", "Zu einfach!", "Слишком просто!", "Çok kolay!", "Terlalu mudah!"],
  "Next!": ["¡Siguiente!", "Próximo!", "Suivant !", "Der Nächste!", "Следующий!", "Sıradaki!", "Berikutnya!"],
  "Nooo!": ["¡Nooo!", "Nããão!", "Nooon !", "Neiiin!", "Нееет!", "Hayııır!", "Tidaaak!"],
  "My gold!": ["¡Mi oro!", "Meu ouro!", "Mon or !", "Mein Gold!", "Моё золото!", "Altınım!", "Emasku!"],
  "Not fair!": ["¡No es justo!", "Não é justo!", "Pas juste !", "Unfair!", "Нечестно!", "Haksızlık!", "Tidak adil!"],
  "Build your traps!": ["¡Construye tus trampas!", "Monte suas armadilhas!", "Pose tes pièges !", "Baue deine Fallen!", "Ставь ловушки!", "Tuzaklarını kur!", "Pasang jebakanmu!"],
  "Release the heroes!": ["¡Que vengan los héroes!", "Soltem os heróis!", "Lâchez les héros !", "Lasst die Helden los!", "Выпускайте героев!", "Kahramanları salın!", "Lepaskan para pahlawan!"],
  "The gold is safe! Mwahaha!": ["¡El oro está a salvo! ¡Muajaja!", "O ouro está seguro! Muahaha!", "L'or est sauf ! Mwahaha !", "Das Gold ist sicher! Mwahaha!", "Золото в безопасности! Муахаха!", "Altın güvende! Muhahaha!", "Emasnya aman! Mwahaha!"],
  "They learned it?!": ["¿¡Lo aprendieron!?", "Eles aprenderam?!", "Ils ont appris ?!", "Sie haben es gelernt?!", "Они научились?!", "Öğrendiler mi?!", "Mereka belajar?!"],
  "Uh-oh…": ["Oh-oh…", "Ih…", "Oh oh…", "Oh-oh…", "Ой-ой…", "Eyvah…", "Gawat…"],
  "My treasure… noooo!": ["Mi tesoro… ¡nooo!", "Meu tesouro… nããão!", "Mon trésor… nooon !", "Mein Schatz… neiiin!", "Моё сокровище… нееет!", "Hazinem… hayııır!", "Hartaku… tidaaak!"],
  "SMASH!": ["¡ZAS!", "PÁ!", "BAM !", "KRACH!", "БАХ!", "KÜT!", "BRAK!"],
  "BUILD!": ["¡A CONSTRUIR!", "CONSTRUIR!", "CONSTRUIRE !", "BAUEN!", "СТРОЮ!", "İNŞA!", "BANGUN!"],
  "RAGE!": ["¡FURIA!", "FÚRIA!", "RAGE !", "WUT!", "ЯРОСТЬ!", "ÖFKE!", "MURKA!"],
  "IMMUNE": ["INMUNE", "IMUNE", "IMMUNISÉ", "IMMUN", "ИММУНИТЕТ", "BAĞIŞIK", "KEBAL"],
  "DODGE!": ["¡ESQUIVA!", "DESVIOU!", "ESQUIVE !", "AUSWEICHEN!", "УКЛОН!", "KAÇTI!", "MENGHINDAR!"],
  "HA!": ["¡JA!", "HA!", "HA !", "HA!", "ХА!", "HA!", "HA!"],
  "HA HA!": ["¡JA JA!", "HA HA!", "HA HA !", "HA HA!", "ХА-ХА!", "HA HA!", "HA HA!"],

  // toasts
  "No ad available right now — try again later": ["No hay anuncios ahora, inténtalo más tarde", "Nenhum anúncio agora — tente mais tarde", "Aucune pub pour l'instant — réessaie plus tard", "Gerade keine Werbung — versuch es später", "Реклама сейчас недоступна — попробуйте позже", "Şu an reklam yok — sonra tekrar dene", "Iklan belum tersedia — coba lagi nanti"],
  "Level {n}: {name}": ["Nivel {n}: {name}", "Fase {n}: {name}", "Niveau {n} : {name}", "Level {n}: {name}", "Уровень {n}: {name}", "Bölüm {n}: {name}", "Level {n}: {name}"],
  "The pits are full of {fluid} — drop a Croc, Lava Bubble or Acid Geyser in them!": ["Los fosos están llenos de {fluid}: ¡pon ahí un Cocodrilo, una Burbuja de lava o un Géiser ácido!", "Os buracos estão cheios de {fluid} — coloque um Croc, Bolha de Lava ou Gêiser Ácido neles!", "Les fosses sont pleines de {fluid} — mets-y un Croco, une Bulle de lave ou un Geyser d'acide !", "Die Gruben sind voller {fluid} — setz ein Kroko, eine Lavablase oder einen Säuregeysir hinein!", "Ямы полны: {fluid} — посадите туда Крокодила, Лавовый шар или Кислотный гейзер!", "Çukurlar {fluid} dolu — içine Timsah, Lav Topu ya da Asit Gayzeri koy!", "Lubang penuh {fluid} — taruh Buaya, Bola Lava atau Geiser Asam di dalamnya!"],
  "Ice level: heroes slip and slide — they can't stop on a dime!": ["Nivel de hielo: los héroes resbalan y no pueden frenar de golpe.", "Fase de gelo: os heróis escorregam e não param na hora!", "Niveau glacé : les héros glissent et ne peuvent pas s'arrêter net !", "Eislevel: Helden rutschen und können nicht sofort stoppen!", "Ледяной уровень: герои скользят и не могут резко остановиться!", "Buz bölümü: kahramanlar kayar, aniden duramaz!", "Level es: pahlawan tergelincir dan tak bisa berhenti mendadak!"],
  "New trap unlocked: {name}!": ["¡Nueva trampa: {name}!", "Nova armadilha: {name}!", "Nouveau piège : {name} !", "Neue Falle: {name}!", "Новая ловушка: {name}!", "Yeni tuzak: {name}!", "Jebakan baru: {name}!"],
  "New hero: {name} — {tip}": ["Nuevo héroe: {name} — {tip}", "Novo herói: {name} — {tip}", "Nouveau héros : {name} — {tip}", "Neuer Held: {name} — {tip}", "Новый герой: {name} — {tip}", "Yeni kahraman: {name} — {tip}", "Pahlawan baru: {name} — {tip}"],
  "Heroes figured out the {name}! Mix it up!": ["¡Los héroes entendieron {name}! ¡Cambia de táctica!", "Os heróis entenderam {name}! Mude a estratégia!", "Les héros ont compris {name} ! Change de tactique !", "Die Helden haben {name} durchschaut! Misch es neu!", "Герои разгадали: {name}! Меняйте тактику!", "Kahramanlar {name} tuzağını çözdü! Taktik değiştir!", "Pahlawan sudah paham {name}! Ganti taktik!"],
  "The heroes are building steps over your wall!": ["¡Los héroes construyen escalones sobre tu muro!", "Os heróis estão construindo degraus no seu muro!", "Les héros construisent des marches sur ton mur !", "Die Helden bauen Stufen über deine Mauer!", "Герои строят ступени через вашу стену!", "Kahramanlar duvarına basamak yapıyor!", "Pahlawan membangun tangga melewati tembokmu!"],
  "Max 2 {name} traps close together — spread them out!": ["Máximo 2 de {name} juntas, ¡sepáralas!", "Máximo 2 de {name} juntas — espalhe!", "2 {name} max. côte à côte — espace-les !", "Max. 2× {name} nah beieinander — verteil sie!", "Не больше 2 ({name}) рядом — расставьте шире!", "Yan yana en fazla 2 {name} — dağıt!", "Maks. 2 {name} berdekatan — sebar!"],
  "Not enough coins": ["No tienes monedas suficientes", "Moedas insuficientes", "Pas assez de pièces", "Nicht genug Münzen", "Недостаточно монет", "Yeterli altın yok", "Koin tidak cukup"],
  "Trap limit reached ({n}). Sell one or start the wave.": ["Límite de trampas ({n}). Vende una o empieza la oleada.", "Limite de armadilhas ({n}). Venda uma ou comece a onda.", "Limite de pièges ({n}). Vends-en un ou lance la vague.", "Fallenlimit erreicht ({n}). Verkaufe eine oder starte die Welle.", "Лимит ловушек ({n}). Продайте одну или начните волну.", "Tuzak sınırı ({n}). Birini sat ya da dalgayı başlat.", "Batas jebakan ({n}). Jual satu atau mulai gelombang."],
  "+{n} coins!": ["¡+{n} monedas!", "+{n} moedas!", "+{n} pièces !", "+{n} Münzen!", "+{n} монет!", "+{n} altın!", "+{n} koin!"],
  "+2 trap slots for this level!": ["¡+2 huecos de trampa en este nivel!", "+2 espaços de armadilha nesta fase!", "+2 emplacements de piège pour ce niveau !", "+2 Fallenplätze für dieses Level!", "+2 места для ловушек на этом уровне!", "Bu bölüm için +2 tuzak yeri!", "+2 slot jebakan di level ini!"],
  "Lucky Crate: a FREE {name}! Place it anywhere it fits.": ["Caja de la suerte: ¡{name} GRATIS! Colócala donde quepa.", "Caixa da Sorte: {name} GRÁTIS! Coloque onde couber.", "Caisse chanceuse : {name} GRATUIT ! Pose-le où il rentre.", "Glückskiste: {name} GRATIS! Platziere es, wo es passt.", "Счастливый ящик: {name} БЕСПЛАТНО! Ставьте куда угодно.", "Şans Kutusu: BEDAVA {name}! Uygun yere koy.", "Peti Keberuntungan: {name} GRATIS! Taruh di mana saja."],
  "Wipe the heroes' memory? They will forget everything they learned.": ["¿Borrar la memoria de los héroes? Olvidarán todo lo aprendido.", "Apagar a memória dos heróis? Eles esquecerão tudo.", "Effacer la mémoire des héros ? Ils oublieront tout.", "Gedächtnis der Helden löschen? Sie vergessen alles.", "Стереть память героев? Они забудут всё.", "Kahramanların hafızası silinsin mi? Her şeyi unutacaklar.", "Hapus ingatan pahlawan? Mereka akan lupa semuanya."],
  "Hero memory wiped": ["Memoria borrada", "Memória apagada", "Mémoire effacée", "Gedächtnis gelöscht", "Память стёрта", "Hafıza silindi", "Ingatan dihapus"],

  // HUD & bar
  "Wave": ["Oleada", "Onda", "Vague", "Welle", "Волна", "Dalga", "Gelombang"],
  "Remaining": ["Quedan", "Restam", "Restants", "Übrig", "Осталось", "Kalan", "Sisa"],
  "Inbound": ["En camino", "A caminho", "En approche", "Im Anmarsch", "На подходе", "Geliyor", "Datang"],
  "Traps {a}/{b}": ["Trampas {a}/{b}", "Armadilhas {a}/{b}", "Pièges {a}/{b}", "Fallen {a}/{b}", "Ловушки {a}/{b}", "Tuzak {a}/{b}", "Jebakan {a}/{b}"],
  "Hero Brain IQ {n}": ["IQ de los héroes {n}", "QI dos heróis {n}", "QI des héros {n}", "Helden-IQ {n}", "IQ героев {n}", "Kahraman IQ {n}", "IQ Pahlawan {n}"],
  "Brain": ["Cerebro", "Cérebro", "Cerveau", "Gehirn", "Мозг", "Beyin", "Otak"],
  "Heat": ["Calor", "Calor", "Chaleur", "Hitze", "Тепло", "Isı", "Panas"],
  "Castle": ["Castillo", "Castelo", "Château", "Burg", "Замок", "Kale", "Kastil"],
  "FREE!": ["¡GRATIS!", "GRÁTIS!", "GRATUIT !", "GRATIS!", "БЕСПЛАТНО!", "BEDAVA!", "GRATIS!"],
  "Restock 3": ["Cambiar 3", "Trocar 3", "Changer 3", "Neu 3", "Обновить 3", "Yenile 3", "Ganti 3"],
  "Sell": ["Vender", "Vender", "Vendre", "Verkaufen", "Продать", "Sat", "Jual"],
  "START WAVE ▶": ["EMPEZAR ▶", "COMEÇAR ▶", "LANCER ▶", "WELLE STARTEN ▶", "НАЧАТЬ ВОЛНУ ▶", "DALGAYI BAŞLAT ▶", "MULAI ▶"],
  "  ·  Heroes have learned to {action} it": ["  ·  Los héroes aprendieron a: {action}", "  ·  Os heróis aprenderam: {action}", "  ·  Les héros ont appris : {action}", "  ·  Die Helden haben gelernt: {action}", "  ·  Герои научились: {action}", "  ·  Kahramanlar öğrendi: {action}", "  ·  Pahlawan belajar: {action}"],
  "Follow": ["Seguir", "Seguir", "Suivre", "Folgen", "Следить", "Takip", "Ikuti"],
  "Killed {a}/{b}": ["Eliminados {a}/{b}", "Derrotados {a}/{b}", "Vaincus {a}/{b}", "Besiegt {a}/{b}", "Побеждено {a}/{b}", "Yenilen {a}/{b}", "Dikalahkan {a}/{b}"],
  "Damage taken {n}": ["Daño recibido {n}", "Dano sofrido {n}", "Dégâts subis {n}", "Schaden {n}", "Урон {n}", "Alınan hasar {n}", "Kerusakan {n}"],
  "Drag or WASD to look around · Z/X or wheel to zoom · H heatmap": ["Arrastra o WASD para mirar · Z/X o rueda para zoom · H mapa de calor", "Arraste ou WASD para olhar · Z/X ou roda para zoom · H mapa de calor", "Glisse ou ZQSD pour regarder · Z/X ou molette pour zoomer · H carte", "Ziehen oder WASD zum Umsehen · Z/X oder Rad zum Zoomen · H Heatmap", "Тяните или WASD — обзор · Z/X или колесо — зум · H — тепловая карта", "Bakmak için sürükle/WASD · Yakınlaştırma Z/X/teker · H ısı haritası", "Seret atau WASD untuk melihat · Z/X atau roda untuk zoom · H peta panas"],
  "Drag to look around · pinch or +/− to zoom · hold a trap to sell": ["Arrastra para mirar · pellizca o +/− para zoom · mantén una trampa para venderla", "Arraste para olhar · pinça ou +/− para zoom · segure uma armadilha para vender", "Glisse pour regarder · pince ou +/− pour zoomer · maintiens un piège pour le vendre", "Ziehen zum Umsehen · Zwei Finger oder +/− zum Zoomen · Falle halten zum Verkaufen", "Тяните для обзора · щипок или +/− — зум · удерживайте ловушку, чтобы продать", "Bakmak için sürükle · yakınlaştırmak için iki parmak ya da +/− · satmak için tuzağa basılı tut", "Seret untuk melihat · cubit atau +/− untuk zoom · tahan jebakan untuk menjual"],
  "Hold a trap to sell it": ["Mantén una trampa para venderla", "Segure uma armadilha para vender", "Maintiens un piège pour le vendre", "Falle halten zum Verkaufen", "Удерживайте ловушку, чтобы продать", "Satmak için tuzağa basılı tut", "Tahan jebakan untuk menjual"],
  "+2 Trap slots": ["+2 huecos", "+2 espaços", "+2 emplacements", "+2 Fallenplätze", "+2 места", "+2 tuzak yeri", "+2 slot"],
  "🎁 Lucky Crate": ["🎁 Caja suerte", "🎁 Caixa da Sorte", "🎁 Caisse chance", "🎁 Glückskiste", "🎁 Удачный ящик", "🎁 Şans Kutusu", "🎁 Peti Hoki"],
  "NEXT UP · INBOUND": ["PRÓXIMOS · EN CAMINO", "PRÓXIMOS · A CAMINHO", "À VENIR · EN APPROCHE", "ALS NÄCHSTES", "СЛЕДУЮЩИЕ", "SIRADAKİLER", "BERIKUTNYA"],
  "+ {n} more hero types": ["+ {n} tipos más", "+ {n} tipos a mais", "+ {n} autres types", "+ {n} weitere Arten", "+ ещё {n} типов", "+ {n} tür daha", "+ {n} jenis lagi"],
  "Payout": ["Pago", "Pagamento", "Gain", "Lohn", "Награда", "Ödül", "Hadiah"],
  "+{n} base · 1–3 per kill": ["+{n} base · 1–3 por baja", "+{n} base · 1–3 por abate", "+{n} base · 1–3 par héros", "+{n} Basis · 1–3 pro Held", "+{n} база · 1–3 за героя", "+{n} temel · yenilen başına 1–3", "+{n} dasar · 1–3 per kalah"],
  "Perfect wave bonus +8": ["Bonus de oleada perfecta +8", "Bônus de onda perfeita +8", "Bonus vague parfaite +8", "Bonus perfekte Welle +8", "Бонус за идеальную волну +8", "Kusursuz dalga bonusu +8", "Bonus gelombang sempurna +8"],

  // brain panel
  "Hero Guild Brain v2": ["Cerebro del gremio v2", "Cérebro da guilda v2", "Cerveau de la guilde v2", "Gilden-Gehirn v2", "Мозг гильдии v2", "Lonca Beyni v2", "Otak Serikat v2"],
  "IQ {iq}  ·  {s} situations  ·  {m} memories  ·  {g} hero tactics": ["IQ {iq} · {s} situaciones · {m} recuerdos · {g} tácticas", "QI {iq} · {s} situações · {m} memórias · {g} táticas", "QI {iq} · {s} situations · {m} souvenirs · {g} tactiques", "IQ {iq} · {s} Lagen · {m} Erinnerungen · {g} Taktiken", "IQ {iq} · {s} ситуаций · {m} воспоминаний · {g} тактик", "IQ {iq} · {s} durum · {m} anı · {g} taktik", "IQ {iq} · {s} situasi · {m} ingatan · {g} taktik"],
  "Learns per trap, per hero type, and spots trap combos. Studies old fights between waves;": ["Aprende por trampa y por tipo de héroe, y detecta combos. Repasa batallas entre oleadas;", "Aprende por armadilha e tipo de herói e percebe combos. Estuda lutas entre ondas;", "Apprend par piège et par héros, repère les combos. Révise les combats entre les vagues ;", "Lernt je Falle und Heldentyp, erkennt Combos. Lernt zwischen Wellen aus alten Kämpfen;", "Учится по каждой ловушке и типу героя, видит комбо. Между волнами изучает старые бои;", "Tuzak ve kahraman türüne göre öğrenir, komboları fark eder. Dalgalar arasında eski dövüşleri çalışır;", "Belajar per jebakan dan jenis pahlawan, mengenali kombo. Mempelajari pertarungan lama di antara gelombang;"],
  "at traps that keep killing them, heroes try brand-new tricks (danger sense).": ["en trampas que los matan, prueban trucos nuevos (sentido del peligro).", "em armadilhas que matam muito, tentam truques novos (senso de perigo).", "face aux pièges mortels, ils tentent de nouvelles astuces (sens du danger).", "an tödlichen Fallen probieren sie neue Tricks (Gefahrensinn).", "у смертельных ловушек пробуют новые приёмы (чувство опасности).", "çok öldüren tuzaklarda yeni numaralar dener (tehlike sezgisi).", "di jebakan mematikan mereka coba trik baru (indra bahaya)."],
  "unseen": ["sin ver", "não visto", "inconnu", "unbekannt", "не встречали", "görülmedi", "belum terlihat"],
  "Wipe hero memory": ["Borrar memoria", "Apagar memória", "Effacer la mémoire", "Gedächtnis löschen", "Стереть память", "Hafızayı sil", "Hapus ingatan"],
  "go": ["seguir", "seguir", "avancer", "gehen", "идти", "yürü", "jalan"],
  "jump": ["saltar", "pular", "sauter", "springen", "прыгать", "zıpla", "lompat"],
  "wait": ["esperar", "esperar", "attendre", "warten", "ждать", "bekle", "tunggu"],
  "dash": ["correr", "correr", "foncer", "sprinten", "рывок", "koş", "lari"],
  "walk on": ["seguir", "seguir", "avancer", "weitergehen", "идти", "devam", "jalan terus"],

  // menus
  "Paused": ["Pausa", "Pausado", "Pause", "Pause", "Пауза", "Duraklatıldı", "Jeda"],
  "Resume": ["Continuar", "Continuar", "Reprendre", "Weiter", "Продолжить", "Devam", "Lanjut"],
  "Restart level": ["Reiniciar nivel", "Reiniciar fase", "Recommencer", "Level neu starten", "Заново", "Bölümü yeniden başlat", "Ulangi level"],
  "Main menu": ["Menú principal", "Menu principal", "Menu principal", "Hauptmenü", "Главное меню", "Ana menü", "Menu utama"],
  "Music: ON": ["Música: SÍ", "Música: ON", "Musique : ON", "Musik: AN", "Музыка: ВКЛ", "Müzik: AÇIK", "Musik: NYALA"],
  "Music: OFF": ["Música: NO", "Música: OFF", "Musique : OFF", "Musik: AUS", "Музыка: ВЫКЛ", "Müzik: KAPALI", "Musik: MATI"],
  "Sound: ON": ["Sonido: SÍ", "Som: ON", "Son : ON", "Ton: AN", "Звук: ВКЛ", "Ses: AÇIK", "Suara: NYALA"],
  "Sound: OFF": ["Sonido: NO", "Som: OFF", "Son : OFF", "Ton: AUS", "Звук: ВЫКЛ", "Ses: KAPALI", "Suara: MATI"],
  "Sound effects: ON": ["Efectos: SÍ", "Efeitos: ON", "Effets : ON", "Effekte: AN", "Эффекты: ВКЛ", "Efektler: AÇIK", "Efek: NYALA"],
  "Sound effects: OFF": ["Efectos: NO", "Efeitos: OFF", "Effets : OFF", "Effekte: AUS", "Эффекты: ВЫКЛ", "Efektler: KAPALI", "Efek: MATI"],
  "Language": ["Idioma", "Idioma", "Langue", "Sprache", "Язык", "Dil", "Bahasa"],
  "WAVE COMPLETE": ["¡OLEADA SUPERADA!", "ONDA CONCLUÍDA", "VAGUE TERMINÉE", "WELLE GESCHAFFT", "ВОЛНА ОТБИТА", "DALGA BİTTİ", "GELOMBANG SELESAI"],
  "KILL RATE": ["% ELIMINADOS", "TAXA DE ABATE", "TAUX DE VICTOIRE", "TREFFERQUOTE", "ПОБЕЖДЕНО", "YENME ORANI", "TINGKAT KALAH"],
  "{n}% vs last wave": ["{n}% vs. anterior", "{n}% vs. anterior", "{n}% vs vague préc.", "{n}% ggü. letzter Welle", "{n}% к прошлой волне", "önceki dalgaya göre {n}%", "{n}% vs sebelumnya"],
  "{n} Killed": ["{n} eliminados", "{n} derrotados", "{n} vaincus", "{n} besiegt", "Побеждено: {n}", "{n} yenildi", "{n} kalah"],
  "{n} Total": ["{n} en total", "{n} no total", "{n} au total", "{n} gesamt", "Всего: {n}", "Toplam {n}", "Total {n}"],
  "DAMAGE TAKEN": ["DAÑO RECIBIDO", "DANO SOFRIDO", "DÉGÂTS SUBIS", "SCHADEN", "УРОН", "ALINAN HASAR", "KERUSAKAN"],
  "PERFECT WAVE! +8": ["¡OLEADA PERFECTA! +8", "ONDA PERFEITA! +8", "VAGUE PARFAITE ! +8", "PERFEKTE WELLE! +8", "ИДЕАЛЬНО! +8", "KUSURSUZ DALGA! +8", "SEMPURNA! +8"],
  "Lost perfect wave": ["Sin oleada perfecta", "Sem onda perfeita", "Vague parfaite ratée", "Keine perfekte Welle", "Не идеально", "Kusursuz değil", "Tidak sempurna"],
  "Payout +{n} coins": ["Pago +{n} monedas", "Pagamento +{n} moedas", "Gain +{n} pièces", "Lohn +{n} Münzen", "Награда +{n} монет", "Ödül +{n} altın", "Hadiah +{n} koin"],
  "  (doubled!)": ["  (¡doble!)", "  (dobrado!)", "  (doublé !)", "  (verdoppelt!)", "  (вдвойне!)", "  (iki kat!)", "  (dobel!)"],
  "🧠 The hero guild studied {n} old fights": ["🧠 El gremio repasó {n} batallas", "🧠 A guilda estudou {n} lutas antigas", "🧠 La guilde a révisé {n} combats", "🧠 Die Gilde studierte {n} alte Kämpfe", "🧠 Гильдия изучила {n} старых боёв", "🧠 Lonca {n} eski dövüşü çalıştı", "🧠 Serikat mempelajari {n} pertarungan"],
  "Double payout +{n}": ["Pago doble +{n}", "Dobrar +{n}", "Doubler +{n}", "Doppelt +{n}", "Удвоить +{n}", "İki katı +{n}", "Dobel +{n}"],
  "Continue ▶": ["Continuar ▶", "Continuar ▶", "Continuer ▶", "Weiter ▶", "Дальше ▶", "Devam ▶", "Lanjut ▶"],
  "Loading the dungeon… {n}%": ["Cargando la mazmorra… {n}%", "Carregando a masmorra… {n}%", "Chargement du donjon… {n}%", "Lade den Kerker… {n}%", "Загрузка подземелья… {n}%", "Zindan yükleniyor… {n}%", "Memuat penjara bawah tanah… {n}%"],
  "Tip: a Spring right before a pit sends heroes flying.": ["Consejo: un Muelle justo antes de un foso hace volar a los héroes.", "Dica: uma Mola antes de um buraco faz os heróis voarem.", "Astuce : un Ressort juste avant une fosse fait voler les héros.", "Tipp: Eine Feder direkt vor einer Grube lässt Helden fliegen.", "Совет: Пружина перед ямой отправит героев в полёт.", "İpucu: çukurdan hemen önce Yay, kahramanları uçurur.", "Tips: Pegas di depan lubang membuat pahlawan terbang."],
  "Tip: heroes learn — swap your traps when they get smart.": ["Consejo: los héroes aprenden, cambia tus trampas.", "Dica: os heróis aprendem — troque as armadilhas.", "Astuce : les héros apprennent — change tes pièges.", "Tipp: Helden lernen — wechsle deine Fallen.", "Совет: герои учатся — меняйте ловушки.", "İpucu: kahramanlar öğrenir — tuzaklarını değiştir.", "Tips: pahlawan belajar — ganti jebakanmu."],
  "Tip: Spike Balls can float anywhere in the air.": ["Consejo: las Bolas de pinchos flotan en cualquier lugar del aire.", "Dica: Bolas de Espinhos flutuam em qualquer lugar do ar.", "Astuce : les Boules à pointes flottent n'importe où.", "Tipp: Stachelkugeln schweben überall in der Luft.", "Совет: Шипастые шары висят в любом месте в воздухе.", "İpucu: Dikenli Toplar havada her yerde durabilir.", "Tips: Bola Duri bisa melayang di mana saja."],
  "Tip: the Croc snaps at heroes who try to jump over it.": ["Consejo: el Cocodrilo muerde a quien intenta saltarlo.", "Dica: o Croc morde quem tenta pular por cima.", "Astuce : le Croco happe ceux qui sautent par-dessus.", "Tipp: Das Kroko schnappt nach springenden Helden.", "Совет: Крокодил хватает тех, кто прыгает над ним.", "İpucu: Timsah üstünden atlayanları kapar.", "Tips: Buaya menggigit pahlawan yang melompatinya."],
  "Build the traps. The heroes learn. Outsmart them.": ["Pon trampas. Los héroes aprenden. Sé más listo.", "Monte armadilhas. Os heróis aprendem. Seja mais esperto.", "Pose des pièges. Les héros apprennent. Sois plus malin.", "Baue Fallen. Die Helden lernen. Überliste sie.", "Ставь ловушки. Герои учатся. Перехитри их.", "Tuzak kur. Kahramanlar öğrenir. Onları alt et.", "Pasang jebakan. Pahlawan belajar. Akali mereka."],
  "🎃 NEW: Halloween Night!": ["🎃 NUEVO: ¡Noche de Halloween!", "🎃 NOVO: Noite de Halloween!", "🎃 NOUVEAU : Nuit d'Halloween !", "🎃 NEU: Halloween-Nacht!", "🎃 НОВОЕ: Ночь Хэллоуина!", "🎃 YENİ: Cadılar Bayramı Gecesi!", "🎃 BARU: Malam Halloween!"],
  "▶  PLAY  ·  Level {n}": ["▶  JUGAR  ·  Nivel {n}", "▶  JOGAR  ·  Fase {n}", "▶  JOUER  ·  Niveau {n}", "▶  SPIELEN  ·  Level {n}", "▶  ИГРАТЬ  ·  Ур. {n}", "▶  OYNA  ·  Bölüm {n}", "▶  MAIN  ·  Level {n}"],
  "Levels": ["Niveles", "Fases", "Niveaux", "Level", "Уровни", "Bölümler", "Level"],
  "Settings": ["Ajustes", "Opções", "Réglages", "Optionen", "Настройки", "Ayarlar", "Pengaturan"],
  "Credits": ["Créditos", "Créditos", "Crédits", "Credits", "Авторы", "Emeği geçenler", "Kredit"],
  "Hero Brain IQ {n} · heroes remember your traps": ["IQ de los héroes {n} · recuerdan tus trampas", "QI dos heróis {n} · eles lembram das armadilhas", "QI des héros {n} · ils se souviennent de tes pièges", "Helden-IQ {n} · sie merken sich deine Fallen", "IQ героев {n} · они помнят ваши ловушки", "Kahraman IQ {n} · tuzaklarını hatırlarlar", "IQ Pahlawan {n} · mereka ingat jebakanmu"],
  "Choose a level": ["Elige un nivel", "Escolha uma fase", "Choisis un niveau", "Wähle ein Level", "Выберите уровень", "Bölüm seç", "Pilih level"],
  "World {n} · {name}": ["Mundo {n} · {name}", "Mundo {n} · {name}", "Monde {n} · {name}", "Welt {n} · {name}", "Мир {n} · {name}", "Dünya {n} · {name}", "Dunia {n} · {name}"],
  "Locked": ["Bloqueado", "Bloqueado", "Verrouillé", "Gesperrt", "Закрыто", "Kilitli", "Terkunci"],
  "❄ ICE": ["❄ HIELO", "❄ GELO", "❄ GLACE", "❄ EIS", "❄ ЛЁД", "❄ BUZ", "❄ ES"],
  "🎃 NEW": ["🎃 NUEVO", "🎃 NOVO", "🎃 NEUF", "🎃 NEU", "🎃 НОВОЕ", "🎃 YENİ", "🎃 BARU"],
  "◀  Back": ["◀  Volver", "◀  Voltar", "◀  Retour", "◀  Zurück", "◀  Назад", "◀  Geri", "◀  Kembali"],
  "Back": ["Volver", "Voltar", "Retour", "Zurück", "Назад", "Geri", "Kembali"],
  "Game, code & design": ["Juego, código y diseño", "Jogo, código e design", "Jeu, code et design", "Spiel, Code & Design", "Игра, код и дизайн", "Oyun, kod ve tasarım", "Game, kode & desain"],
  "Characters & traps art": ["Arte de personajes y trampas", "Arte de personagens e armadilhas", "Graphismes personnages et pièges", "Figuren- & Fallengrafik", "Графика героев и ловушек", "Karakter ve tuzak çizimleri", "Seni karakter & jebakan"],
  "Music": ["Música", "Música", "Musique", "Musik", "Музыка", "Müzik", "Musik"],
  "Sound effects": ["Efectos de sonido", "Efeitos sonoros", "Effets sonores", "Soundeffekte", "Звуковые эффекты", "Ses efektleri", "Efek suara"],
  "Font": ["Fuente", "Fonte", "Police", "Schrift", "Шрифт", "Yazı tipi", "Fon"],
  "How to play": ["Cómo jugar", "Como jogar", "Comment jouer", "So wird gespielt", "Как играть", "Nasıl oynanır", "Cara bermain"],
  "1. Pick a trap below (or press 1–5), then click a glowing cell.": ["1. Elige una trampa abajo (o pulsa 1–5) y toca una casilla brillante.", "1. Escolha uma armadilha abaixo (ou 1–5) e toque numa casa brilhante.", "1. Choisis un piège en bas (ou 1–5), puis clique sur une case lumineuse.", "1. Wähle unten eine Falle (oder 1–5) und klicke ein leuchtendes Feld.", "1. Выберите ловушку внизу (или 1–5) и нажмите на светящуюся клетку.", "1. Aşağıdan bir tuzak seç (veya 1–5), sonra parlayan kareye tıkla.", "1. Pilih jebakan di bawah (atau 1–5), lalu klik kotak yang menyala."],
  "2. Spike Balls & cannons float in mid-air · Rocks, Axes, Crushers hang under ceilings and platforms.": ["2. Bolas de pinchos y cañones flotan en el aire · Rocas, Hachas y Aplastadores cuelgan de techos y plataformas.", "2. Bolas de espinhos e canhões flutuam no ar · Pedras, Machados e Esmagadores ficam sob tetos e plataformas.", "2. Boules à pointes et canons flottent · Rochers, Haches, Écraseurs pendent sous plafonds et plateformes.", "2. Stachelkugeln & Kanonen schweben · Felsen, Äxte, Stampfer hängen unter Decken und Plattformen.", "2. Шипастые шары и пушки висят в воздухе · Камни, Топоры, Давилки — под потолком и платформами.", "2. Dikenli toplar ve toplar havada durur · Kaya, Balta, Ezici tavan ve platform altına asılır.", "2. Bola duri & meriam melayang di udara · Batu, Kapak, Penghancur digantung di bawah langit-langit/platform."],
  "3. Press START WAVE and watch the crowd come. Drag to look around.": ["3. Pulsa EMPEZAR y mira llegar a la multitud. Arrastra para mirar.", "3. Aperte COMEÇAR e veja a multidão chegar. Arraste para olhar.", "3. Appuie sur LANCER et regarde la foule arriver. Glisse pour regarder.", "3. Drück WELLE STARTEN und sieh die Menge kommen. Ziehen zum Umsehen.", "3. Нажмите НАЧАТЬ ВОЛНУ и смотрите на толпу. Тяните для обзора.", "3. DALGAYI BAŞLAT'a bas, kalabalığı izle. Bakmak için sürükle.", "3. Tekan MULAI dan lihat kerumunan datang. Seret untuk melihat."],
  "4. Heroes LEARN from every trap — keep changing your plan!": ["4. Los héroes APRENDEN de cada trampa: ¡cambia tu plan!", "4. Os heróis APRENDEM com cada armadilha — mude seu plano!", "4. Les héros APPRENNENT de chaque piège — change ton plan !", "4. Helden LERNEN aus jeder Falle — ändere deinen Plan!", "4. Герои УЧАТСЯ на каждой ловушке — меняйте план!", "4. Kahramanlar her tuzaktan ÖĞRENİR — planını değiştir!", "4. Pahlawan BELAJAR dari tiap jebakan — ubah rencanamu!"],
  "Level complete!": ["¡Nivel superado!", "Fase concluída!", "Niveau terminé !", "Level geschafft!", "Уровень пройден!", "Bölüm tamam!", "Level selesai!"],
  "{k} heroes defeated · Castle {hp}/100 · Hero Brain IQ {iq}": ["{k} héroes derrotados · Castillo {hp}/100 · IQ {iq}", "{k} heróis derrotados · Castelo {hp}/100 · QI {iq}", "{k} héros vaincus · Château {hp}/100 · QI {iq}", "{k} Helden besiegt · Burg {hp}/100 · IQ {iq}", "Побеждено героев: {k} · Замок {hp}/100 · IQ {iq}", "{k} kahraman yenildi · Kale {hp}/100 · IQ {iq}", "{k} pahlawan kalah · Kastil {hp}/100 · IQ {iq}"],
  "Play again": ["Jugar otra vez", "Jogar de novo", "Rejouer", "Nochmal spielen", "Играть снова", "Tekrar oyna", "Main lagi"],
  "Next level ▶": ["Siguiente nivel ▶", "Próxima fase ▶", "Niveau suivant ▶", "Nächstes Level ▶", "Следующий уровень ▶", "Sonraki bölüm ▶", "Level berikutnya ▶"],
  "Replay": ["Repetir", "Repetir", "Rejouer", "Wiederholen", "Переиграть", "Tekrarla", "Ulangi"],
  "The castle fell!": ["¡El castillo cayó!", "O castelo caiu!", "Le château est tombé !", "Die Burg ist gefallen!", "Замок пал!", "Kale düştü!", "Kastil jatuh!"],
  "The heroes got smarter. Try new trap combos! (wave {n})": ["Los héroes se volvieron más listos. ¡Prueba combos nuevos! (oleada {n})", "Os heróis ficaram mais espertos. Tente novos combos! (onda {n})", "Les héros sont devenus malins. Essaie de nouveaux combos ! (vague {n})", "Die Helden wurden schlauer. Probier neue Combos! (Welle {n})", "Герои поумнели. Попробуйте новые комбо! (волна {n})", "Kahramanlar akıllandı. Yeni kombolar dene! (dalga {n})", "Pahlawan makin pintar. Coba kombo baru! (gelombang {n})"],
  "Try again": ["Reintentar", "Tentar de novo", "Réessayer", "Nochmal", "Ещё раз", "Tekrar dene", "Coba lagi"],
  "Loading ad…": ["Cargando anuncio…", "Carregando anúncio…", "Chargement de la pub…", "Werbung lädt…", "Загрузка рекламы…", "Reklam yükleniyor…", "Memuat iklan…"],
  "Turn your phone sideways to play 🔄": ["Gira el móvil para jugar 🔄", "Vire o celular para jogar 🔄", "Tourne ton téléphone pour jouer 🔄", "Dreh dein Handy quer 🔄", "Поверните телефон горизонтально 🔄", "Oynamak için telefonu yan çevir 🔄", "Putar ponsel ke samping 🔄"],

  // traps
  "Block": ["Bloque", "Bloco", "Bloc", "Block", "Блок", "Blok", "Balok"],
  "Spring": ["Muelle", "Mola", "Ressort", "Feder", "Пружина", "Yay", "Pegas"],
  "Spikes": ["Pinchos", "Espinhos", "Pointes", "Stacheln", "Шипы", "Dikenler", "Paku"],
  "Slime Pit": ["Charco de baba", "Poça de Gosma", "Fosse gluante", "Schleimgrube", "Слизь", "Balçık", "Lendir"],
  "Fire Vent": ["Chorro de fuego", "Jato de Fogo", "Jet de feu", "Feuerdüse", "Огненный клапан", "Ateş Ağzı", "Semburan Api"],
  "Spike Ball": ["Bola de pinchos", "Bola de Espinhos", "Boule à pointes", "Stachelkugel", "Шипастый шар", "Dikenli Top", "Bola Duri"],
  "Falling Rock": ["Roca que cae", "Pedra Cadente", "Rocher", "Fallender Fels", "Падающий камень", "Düşen Kaya", "Batu Jatuh"],
  "Croc": ["Cocodrilo", "Croc", "Croco", "Kroko", "Крокодил", "Timsah", "Buaya"],
  "Spear Trap": ["Lanzas", "Lanças", "Lances", "Speerfalle", "Копья", "Mızrak", "Tombak"],
  "Saw Blade": ["Sierra", "Serra", "Scie", "Sägeblatt", "Пила", "Testere", "Gergaji"],
  "Swing Axe": ["Hacha péndulo", "Machado Pêndulo", "Hache", "Schwingaxt", "Маятник-топор", "Sallanan Balta", "Kapak Ayun"],
  "Lava Bubble": ["Burbuja de lava", "Bolha de Lava", "Bulle de lave", "Lavablase", "Лавовый шар", "Lav Topu", "Bola Lava"],
  "Fire Cannon": ["Cañón de fuego", "Canhão de Fogo", "Canon de feu", "Feuerkanone", "Огнепушка", "Ateş Topu", "Meriam Api"],
  "Bomb Barrel": ["Barril bomba", "Barril-bomba", "Baril explosif", "Bombenfass", "Бочка-бомба", "Bomba Fıçı", "Tong Bom"],
  "Crusher": ["Aplastador", "Esmagador", "Écraseur", "Stampfer", "Давилка", "Ezici", "Penghancur"],
  "Acid Geyser": ["Géiser ácido", "Gêiser Ácido", "Geyser d'acide", "Säuregeysir", "Кислотный гейзер", "Asit Gayzeri", "Geiser Asam"],
  "Stone Wheel": ["Rueda de piedra", "Roda de Pedra", "Roue de pierre", "Steinrad", "Каменное колесо", "Taş Tekerlek", "Roda Batu"],
  "Ice Cannon": ["Cañón de hielo", "Canhão de Gelo", "Canon de glace", "Eiskanone", "Ледяная пушка", "Buz Topu", "Meriam Es"],
  "Launch Pad": ["Plataforma lanzadora", "Lançador", "Tremplin", "Startrampe", "Катапульта", "Fırlatıcı", "Pelontar"],
  "Spiked Mace": ["Maza con pinchos", "Maça de Espinhos", "Masse à pointes", "Stachelkeule", "Шипастая булава", "Dikenli Gürz", "Gada Duri"],
  "Cannon": ["Cañón", "Canhão", "Canon", "Kanone", "Пушка", "Top", "Meriam"],
  "Crossbow": ["Ballesta", "Besta", "Arbalète", "Armbrust", "Арбалет", "Arbalet", "Busur Silang"],
  "Log Launcher": ["Lanzatroncos", "Lança-toras", "Lance-rondins", "Stammwerfer", "Бревномёт", "Kütük Atar", "Pelontar Kayu"],
  "Flamethrower": ["Lanzallamas", "Lança-chamas", "Lance-flammes", "Flammenwerfer", "Огнемёт", "Alev Makinesi", "Penyembur Api"],
  "Spike Roller": ["Rodillo de pinchos", "Rolo de Espinhos", "Rouleau à pointes", "Stachelwalze", "Шипастый каток", "Dikenli Silindir", "Penggiling Duri"],
  "Drop Cage": ["Jaula", "Jaula", "Cage", "Fallkäfig", "Клетка", "Kafes", "Kurungan"],
  "A brick wall. Reshape the path — heroes can only hop 2 tiles high.": ["Un muro. Cambia el camino: los héroes solo saltan 2 casillas.", "Um muro. Mude o caminho — os heróis só pulam 2 blocos.", "Un mur. Modifie le chemin — les héros ne sautent que 2 cases.", "Eine Mauer. Formt den Weg um — Helden springen nur 2 Felder hoch.", "Стена. Меняет путь — герои прыгают лишь на 2 клетки.", "Bir duvar. Yolu değiştir — kahramanlar 2 kare zıplar.", "Tembok. Ubah jalur — pahlawan hanya lompat 2 kotak."],
  "Bounces heroes backwards. Put it before a pit!": ["Rebota a los héroes hacia atrás. ¡Ponlo antes de un foso!", "Joga os heróis para trás. Coloque antes de um buraco!", "Renvoie les héros en arrière. Mets-le avant une fosse !", "Schleudert Helden zurück. Stell sie vor eine Grube!", "Отбрасывает героев назад. Ставьте перед ямой!", "Kahramanları geri fırlatır. Çukurdan önce koy!", "Memantulkan pahlawan ke belakang. Taruh sebelum lubang!"],
  "Pointy floor: 60 damage. Two in a row finish a hero.": ["Suelo puntiagudo: 60 de daño. Dos seguidas acaban con un héroe.", "Chão pontudo: 60 de dano. Dois seguidos acabam com um herói.", "Sol pointu : 60 dégâts. Deux d'affilée achèvent un héros.", "Spitzer Boden: 60 Schaden. Zwei hintereinander erledigen einen Helden.", "Острый пол: 60 урона. Двое подряд добивают героя.", "Sivri zemin: 60 hasar. Art arda iki tane kahramanı bitirir.", "Lantai runcing: 60 kerusakan. Dua berturut-turut menghabisi pahlawan."],
  "Sticky goo. Heroes that stay in it sink.": ["Baba pegajosa. Quien se queda, se hunde.", "Gosma grudenta. Quem fica, afunda.", "Glu collante. Les héros qui y restent coulent.", "Klebriger Schleim. Wer drin bleibt, versinkt.", "Липкая слизь. Кто задержится — утонет.", "Yapışkan balçık. İçinde kalan batar.", "Lendir lengket. Pahlawan yang diam akan tenggelam."],
  "Blasts a tall flame on a timer.": ["Lanza una llama alta cada cierto tiempo.", "Solta uma chama alta de tempos em tempos.", "Crache une grande flamme à intervalles.", "Schießt in Abständen eine hohe Flamme.", "По таймеру выпускает высокое пламя.", "Belirli aralıklarla uzun alev püskürtür.", "Menyemburkan api tinggi berkala."],
  "Floats anywhere in mid-air. Great for catching jumpers!": ["Flota en cualquier lugar del aire. ¡Ideal contra los que saltan!", "Flutua em qualquer lugar do ar. Ótima contra quem pula!", "Flotte n'importe où. Parfait contre les sauteurs !", "Schwebt überall in der Luft. Super gegen Springer!", "Висит где угодно в воздухе. Ловит прыгунов!", "Havada her yerde durur. Zıplayanlara birebir!", "Melayang di mana saja. Cocok untuk penangkap pelompat!"],
  "Drops when a hero walks close. Hang it under any ceiling or floating platform.": ["Cae cuando un héroe se acerca. Cuélgala de un techo o plataforma.", "Cai quando um herói chega perto. Pendure sob teto ou plataforma.", "Tombe quand un héros approche. À suspendre sous un plafond ou une plateforme.", "Fällt, wenn ein Held nahe kommt. Unter Decke oder Plattform hängen.", "Падает, когда герой рядом. Вешается под потолок или платформу.", "Kahraman yaklaşınca düşer. Tavan veya platform altına as.", "Jatuh saat pahlawan mendekat. Gantung di bawah langit-langit/platform."],
  "Put it IN a pit (or on the floor as a pond). Snaps at heroes jumping over!": ["Ponlo EN un foso (o en el suelo como charca). ¡Muerde a quien salta!", "Coloque DENTRO de um buraco (ou no chão como lago). Morde quem pula!", "Mets-le DANS une fosse (ou au sol en mare). Happe les sauteurs !", "Setz es IN eine Grube (oder als Teich auf den Boden). Schnappt nach Springern!", "Ставьте В яму (или на пол как пруд). Хватает прыгающих!", "Çukurun İÇİNE koy (ya da zemine gölet olarak). Atlayanı kapar!", "Taruh DI lubang (atau di lantai sebagai kolam). Menggigit pelompat!"],
  "Spears shoot up a moment after a hero steps close.": ["Las lanzas salen poco después de que un héroe se acerque.", "Lanças sobem logo depois que um herói se aproxima.", "Les lances jaillissent peu après le passage d'un héros.", "Speere schießen kurz nach Annäherung eines Helden hoch.", "Копья выскакивают, когда герой подходит.", "Kahraman yaklaşınca mızraklar fırlar.", "Tombak muncul sesaat setelah pahlawan mendekat."],
  "Rolls back and forth, cutting again and again.": ["Va y viene cortando una y otra vez.", "Vai e volta cortando sem parar.", "Va et vient en coupant encore et encore.", "Rollt hin und her und schneidet immer wieder.", "Катается туда-сюда и режет снова и снова.", "İleri geri gider, tekrar tekrar keser.", "Bergerak bolak-balik, memotong terus."],
  "A pendulum — timing is everything.": ["Un péndulo: el ritmo lo es todo.", "Um pêndulo — o tempo é tudo.", "Un pendule — tout est dans le timing.", "Ein Pendel — Timing ist alles.", "Маятник — всё решает время.", "Bir sarkaç — zamanlama her şey.", "Pendulum — waktu adalah segalanya."],
  "Lives in a pit and leaps high out of it on a timer.": ["Vive en un foso y salta alto cada cierto tiempo.", "Vive num buraco e salta alto de tempos em tempos.", "Vit dans une fosse et en jaillit à intervalles.", "Lebt in einer Grube und springt regelmäßig hoch heraus.", "Живёт в яме и по таймеру высоко выпрыгивает.", "Çukurda yaşar, aralıklarla yükseğe sıçrar.", "Tinggal di lubang dan melompat tinggi berkala."],
  "Shoots fireballs that set heroes on fire. Place it on the floor or in mid-air.": ["Dispara bolas de fuego que queman. En el suelo o en el aire.", "Atira bolas de fogo que incendeiam. No chão ou no ar.", "Tire des boules de feu enflammées. Au sol ou en l'air.", "Schießt Feuerbälle, die Helden anzünden. Boden oder Luft.", "Стреляет огненными шарами, поджигая героев. На полу или в воздухе.", "Kahramanları yakan ateş topları atar. Zemine ya da havaya koy.", "Menembak bola api yang membakar. Di lantai atau di udara."],
  "Lights up when heroes come close, then BOOM.": ["Se enciende cuando se acercan los héroes y… ¡BUM!", "Acende quando os heróis chegam perto, e BUM.", "S'allume quand les héros approchent, puis BOUM.", "Zündet bei Annäherung, dann BUMM.", "Загорается рядом с героями, затем БУМ.", "Kahramanlar yaklaşınca yanar, sonra BUM.", "Menyala saat pahlawan mendekat, lalu BUM."],
  "A spiked stone block that slams down on heroes below.": ["Un bloque de piedra con pinchos que aplasta a los de abajo.", "Um bloco de pedra com espinhos que esmaga quem está embaixo.", "Un bloc de pierre à pointes qui s'abat sur les héros.", "Ein Steinblock mit Stacheln, der auf Helden niederkracht.", "Каменный блок с шипами обрушивается на героев.", "Aşağıdakilerin üstüne inen dikenli taş blok.", "Balok batu berduri yang menghantam pahlawan di bawah."],
  "Sits in a pit and erupts a tall column of acid.": ["Está en un foso y lanza una columna de ácido.", "Fica num buraco e solta uma coluna de ácido.", "Dans une fosse, crache une colonne d'acide.", "Sitzt in einer Grube und speit eine Säuresäule.", "Сидит в яме и выбрасывает столб кислоты.", "Çukurda durur, yüksek asit sütunu püskürtür.", "Di lubang, menyemburkan kolom asam tinggi."],
  "Rolls at incoming heroes. They must jump it.": ["Rueda hacia los héroes. Deben saltarla.", "Rola na direção dos heróis. Eles precisam pular.", "Roule vers les héros. Ils doivent sauter.", "Rollt auf Helden zu. Sie müssen springen.", "Катится на героев. Нужно перепрыгнуть.", "Kahramanlara yuvarlanır. Atlamaları gerekir.", "Menggelinding ke pahlawan. Mereka harus melompat."],
  "Freezes heroes in place. Frozen heroes take 50% more damage.": ["Congela a los héroes. Congelados reciben un 50% más de daño.", "Congela os heróis. Congelados levam 50% mais dano.", "Gèle les héros. Gelés, ils subissent 50% de dégâts en plus.", "Friert Helden ein. Gefrorene nehmen 50% mehr Schaden.", "Замораживает героев. Замёрзшие получают на 50% больше урона.", "Kahramanları dondurur. Donmuşlar %50 fazla hasar alır.", "Membekukan pahlawan. Yang beku kena 50% kerusakan lebih."],
  "Rockets heroes straight up — into Spike Balls or the ceiling!": ["Lanza a los héroes hacia arriba, ¡contra Bolas de pinchos o el techo!", "Lança os heróis para cima — contra Bolas de Espinhos ou o teto!", "Propulse les héros vers le haut — dans les Boules à pointes !", "Schießt Helden nach oben — in Stachelkugeln oder die Decke!", "Подбрасывает героев вверх — в шары или потолок!", "Kahramanları yukarı fırlatır — Dikenli Toplara ya da tavana!", "Melontarkan pahlawan ke atas — ke Bola Duri atau langit-langit!"],
  "A heavy spiked ball on a long chain. Hits hard and knocks back.": ["Bola pesada con pinchos en una cadena. Golpea fuerte y empuja.", "Bola pesada com espinhos numa corrente. Bate forte e empurra.", "Lourde boule à pointes sur une chaîne. Frappe fort et repousse.", "Schwere Stachelkugel an langer Kette. Trifft hart, wirft zurück.", "Тяжёлый шипастый шар на цепи. Бьёт сильно и отбрасывает.", "Uzun zincirde ağır dikenli top. Sert vurur, geri iter.", "Bola duri berat di rantai panjang. Pukulan keras dan mendorong."],
  "Fires heavy cannonballs at the nearest heroes.": ["Dispara balas pesadas al héroe más cercano.", "Dispara balas pesadas nos heróis mais próximos.", "Tire de lourds boulets sur les héros proches.", "Feuert schwere Kugeln auf die nächsten Helden.", "Стреляет ядрами по ближайшим героям.", "En yakın kahramanlara ağır gülleler atar.", "Menembak peluru berat ke pahlawan terdekat."],
  "Rapid-fire arrows in a straight line. Floor or mid-air.": ["Flechas rápidas en línea recta. Suelo o aire.", "Flechas rápidas em linha reta. Chão ou ar.", "Flèches rapides en ligne droite. Sol ou air.", "Schnelle Pfeile geradeaus. Boden oder Luft.", "Быстрые стрелы по прямой. На полу или в воздухе.", "Düz çizgide hızlı oklar. Zemin ya da hava.", "Panah cepat lurus. Di lantai atau udara."],
  "Launches rolling logs down the path.": ["Lanza troncos rodando por el camino.", "Lança toras rolando pelo caminho.", "Lance des rondins sur le chemin.", "Schickt rollende Stämme den Weg entlang.", "Запускает катящиеся брёвна.", "Yola yuvarlanan kütükler fırlatır.", "Meluncurkan kayu menggelinding."],
  "Sprays a long jet of flame toward the hero door on a timer.": ["Escupe un largo chorro de fuego hacia la puerta de los héroes.", "Solta um longo jato de fogo em direção à porta dos heróis.", "Crache un long jet de flammes vers la porte des héros.", "Sprüht einen langen Flammenstrahl Richtung Heldentür.", "Выпускает длинную струю огня в сторону двери героев.", "Kahraman kapısına doğru uzun alev püskürtür.", "Menyemburkan api panjang ke arah pintu pahlawan."],
  "A spiked log that patrols the whole platform.": ["Un tronco con pinchos que patrulla toda la plataforma.", "Uma tora com espinhos que patrulha a plataforma toda.", "Un rondin à pointes qui patrouille toute la plateforme.", "Ein Stachelstamm, der die ganze Plattform abfährt.", "Шипастое бревно катается по всей платформе.", "Tüm platformu dolaşan dikenli kütük.", "Kayu berduri yang berpatroli di platform."],
  "Snaps shut on heroes right below.": ["Atrapa a los héroes justo debajo.", "Prende os heróis logo abaixo.", "Se referme sur les héros juste en dessous.", "Schnappt über Helden direkt darunter zu.", "Захлопывается над героем прямо внизу.", "Hemen altındaki kahramanı kapar.", "Mengurung pahlawan tepat di bawahnya."],

  // heroes
  "The Hero": ["El Héroe", "O Herói", "Le Héros", "Der Held", "Герой", "Kahraman", "Sang Pahlawan"],
  "The Runner": ["El Corredor", "O Corredor", "Le Coureur", "Der Läufer", "Бегун", "Koşucu", "Si Pelari"],
  "The Knight": ["El Caballero", "O Cavaleiro", "Le Chevalier", "Der Ritter", "Рыцарь", "Şövalye", "Ksatria"],
  "The Brute": ["El Bruto", "O Bruto", "La Brute", "Der Rüpel", "Громила", "Kaba Kuvvet", "Si Kasar"],
  "The Wizard": ["El Mago", "O Mago", "Le Magicien", "Der Zauberer", "Волшебник", "Büyücü", "Penyihir"],
  "The Archer": ["La Arquera", "A Arqueira", "L'Archer", "Die Bogenschützin", "Лучник", "Okçu", "Pemanah"],
  "The Assassin": ["El Asesino", "O Assassino", "L'Assassin", "Der Assassine", "Ассасин", "Suikastçı", "Pembunuh"],
  "The Witch": ["La Bruja", "A Bruxa", "La Sorcière", "Die Hexe", "Ведьма", "Cadı", "Penyihir Wanita"],
  "The Paladin": ["El Paladín", "O Paladino", "Le Paladin", "Der Paladin", "Паладин", "Paladin", "Paladin"],
  "Fire Mage": ["Mago de fuego", "Mago de Fogo", "Mage de feu", "Feuermagier", "Огненный маг", "Ateş Büyücüsü", "Penyihir Api"],
  "Ice Mage": ["Maga de hielo", "Maga de Gelo", "Mage de glace", "Eismagierin", "Ледяной маг", "Buz Büyücüsü", "Penyihir Es"],
  "The Druid": ["El Druida", "O Druida", "Le Druide", "Der Druide", "Друид", "Druid", "Druid"],
  "The Viking": ["El Vikingo", "O Viking", "Le Viking", "Der Wikinger", "Викинг", "Viking", "Viking"],
  "The Orc": ["El Orco", "O Orc", "L'Orc", "Der Ork", "Орк", "Ork", "Orc"],
  "Dark Knight": ["Caballero oscuro", "Cavaleiro Sombrio", "Chevalier noir", "Dunkler Ritter", "Тёмный рыцарь", "Kara Şövalye", "Ksatria Gelap"],
  "Brave but plain.": ["Valiente, pero normal.", "Corajoso, mas simples.", "Courageux mais ordinaire.", "Mutig, aber gewöhnlich.", "Смелый, но обычный.", "Cesur ama sıradan.", "Berani tapi biasa."],
  "Fast on its feet.": ["Muy rápido.", "Muito rápido.", "Très rapide.", "Sehr schnell.", "Очень быстрый.", "Çok hızlı.", "Sangat cepat."],
  "Its shield blocks one heavy hit.": ["Su escudo bloquea un golpe fuerte.", "O escudo bloqueia um golpe forte.", "Son bouclier bloque un gros coup.", "Sein Schild blockt einen schweren Treffer.", "Щит блокирует один сильный удар.", "Kalkanı bir ağır darbeyi engeller.", "Perisainya menahan satu pukulan berat."],
  "Smashes Rocks and Cages.": ["Rompe Rocas y Jaulas.", "Quebra Pedras e Jaulas.", "Brise Rochers et Cages.", "Zerschlägt Felsen und Käfige.", "Ломает камни и клетки.", "Kaya ve Kafesleri kırar.", "Menghancurkan Batu dan Kurungan."],
  "Switches a trap off for a moment.": ["Apaga una trampa un momento.", "Desliga uma armadilha por um tempo.", "Désactive un piège un instant.", "Schaltet eine Falle kurz ab.", "Ненадолго отключает ловушку.", "Bir tuzağı kısa süre kapatır.", "Mematikan jebakan sesaat."],
  "Shoots Rocks, Cages, Crushers and Bombs to set them off early.": ["Dispara a Rocas, Jaulas, Aplastadores y Bombas para activarlos antes.", "Atira em Pedras, Jaulas, Esmagadores e Bombas para ativá-los antes.", "Tire sur Rochers, Cages, Écraseurs et Bombes pour les déclencher.", "Schießt auf Felsen, Käfige, Stampfer und Bomben, um sie früh auszulösen.", "Стреляет по камням, клеткам, давилкам и бомбам, вызывая их раньше.", "Kaya, Kafes, Ezici ve Bombaları erkenden tetikler.", "Menembak Batu, Kurungan, Penghancur dan Bom agar aktif lebih awal."],
  "Shadow-steps past the first hit it would take.": ["Esquiva con un salto de sombra el primer golpe.", "Escapa do primeiro golpe com um passo sombrio.", "Esquive le premier coup en un pas d'ombre.", "Weicht dem ersten Treffer per Schattenschritt aus.", "Теневым шагом уходит от первого удара.", "İlk darbeden gölge adımıyla kaçar.", "Menghindari pukulan pertama dengan langkah bayangan."],
  "Flies over floor traps on her broom.": ["Vuela sobre las trampas del suelo en su escoba.", "Voa sobre armadilhas no chão com a vassoura.", "Survole les pièges au sol sur son balai.", "Fliegt auf dem Besen über Bodenfallen.", "Пролетает над ловушками на метле.", "Süpürgesiyle zemin tuzaklarının üstünden uçar.", "Terbang di atas jebakan lantai dengan sapunya."],
  "Shield + heals nearby heroes.": ["Escudo + cura a los cercanos.", "Escudo + cura heróis próximos.", "Bouclier + soigne les héros proches.", "Schild + heilt Helden in der Nähe.", "Щит + лечит героев рядом.", "Kalkan + yakındakileri iyileştirir.", "Perisai + menyembuhkan pahlawan dekat."],
  "Immune to fire, flames and burning.": ["Inmune al fuego y las quemaduras.", "Imune a fogo e queimaduras.", "Immunisé contre le feu.", "Immun gegen Feuer und Brand.", "Не боится огня и ожогов.", "Ateşe ve yanmaya bağışık.", "Kebal terhadap api."],
  "Immune to ice. Freezes traps and ice-bridges pits.": ["Inmune al hielo. Congela trampas y hace puentes de hielo.", "Imune a gelo. Congela armadilhas e faz pontes de gelo.", "Immunisé contre la glace. Gèle les pièges et les fosses.", "Immun gegen Eis. Friert Fallen ein, baut Eisbrücken.", "Не боится льда. Замораживает ловушки и строит ледяные мосты.", "Buza bağışık. Tuzakları dondurur, çukurlara buz köprü yapar.", "Kebal es. Membekukan jebakan dan membuat jembatan es."],
  "Grows vine bridges over pits and heals.": ["Crea puentes de lianas sobre fosos y cura.", "Cria pontes de cipó sobre buracos e cura.", "Fait pousser des ponts de lianes et soigne.", "Lässt Rankenbrücken wachsen und heilt.", "Выращивает мосты из лиан и лечит.", "Çukurlara sarmaşık köprü kurar ve iyileştirir.", "Menumbuhkan jembatan sulur dan menyembuhkan."],
  "Smashes your Blocks. Rages when hurt.": ["Rompe tus Bloques. Se enfurece herido.", "Quebra seus Blocos. Fica furioso ferido.", "Brise tes Blocs. Enrage quand il est blessé.", "Zerschlägt deine Blöcke. Wütet, wenn verletzt.", "Ломает блоки. Свирепеет от ран.", "Bloklarını kırar. Yaralanınca öfkelenir.", "Menghancurkan Balokmu. Mengamuk saat terluka."],
  "Breaks Rocks, Cages, Crushers and floor cannons.": ["Rompe Rocas, Jaulas, Aplastadores y cañones de suelo.", "Quebra Pedras, Jaulas, Esmagadores e canhões.", "Brise Rochers, Cages, Écraseurs et canons au sol.", "Zerbricht Felsen, Käfige, Stampfer und Bodenkanonen.", "Ломает камни, клетки, давилки и пушки.", "Kaya, Kafes, Ezici ve zemin toplarını kırar.", "Menghancurkan Batu, Kurungan, Penghancur dan meriam."],
  "Cannot be knocked back, bounced or caged.": ["No se le puede empujar, rebotar ni enjaular.", "Não pode ser empurrado, lançado nem preso.", "Impossible à repousser, faire rebondir ou mettre en cage.", "Kann nicht zurückgestoßen, geschleudert oder eingesperrt werden.", "Его нельзя отбросить, подбросить или поймать в клетку.", "Geri itilemez, zıplatılamaz, kafeslenemez.", "Tak bisa didorong, dipantulkan atau dikurung."],

  // levels & worlds & fluids
  "The Dungeon": ["La Mazmorra", "A Masmorra", "Le Donjon", "Der Kerker", "Подземелье", "Zindan", "Penjara Bawah Tanah"],
  "The Overworld": ["El Exterior", "O Mundo Externo", "Le Monde extérieur", "Die Oberwelt", "Поверхность", "Dış Dünya", "Dunia Luar"],
  "Halloween Night": ["Noche de Halloween", "Noite de Halloween", "Nuit d'Halloween", "Halloween-Nacht", "Ночь Хэллоуина", "Cadılar Bayramı Gecesi", "Malam Halloween"],
  "The Old Cellar": ["El Sótano Viejo", "O Porão Velho", "La Vieille Cave", "Der Alte Keller", "Старый погреб", "Eski Mahzen", "Gudang Tua"],
  "Bumpy Halls": ["Salas Desiguales", "Salões Irregulares", "Salles Cahoteuses", "Holprige Hallen", "Ухабистые залы", "Engebeli Salonlar", "Aula Bergelombang"],
  "The Long Vault": ["La Bóveda Larga", "O Cofre Longo", "La Longue Voûte", "Das Lange Gewölbe", "Длинный склеп", "Uzun Mahzen", "Ruang Panjang"],
  "Forgotten Ruins": ["Ruinas Olvidadas", "Ruínas Esquecidas", "Ruines Oubliées", "Vergessene Ruinen", "Забытые руины", "Unutulmuş Harabeler", "Reruntuhan Terlupa"],
  "The Lava Pit": ["El Pozo de Lava", "O Poço de Lava", "La Fosse de Lave", "Die Lavagrube", "Лавовая яма", "Lav Çukuru", "Lubang Lava"],
  "Green Meadow": ["Prado Verde", "Prado Verde", "Pré Vert", "Grüne Wiese", "Зелёный луг", "Yeşil Çayır", "Padang Hijau"],
  "Rolling Hills": ["Colinas Onduladas", "Colinas", "Collines", "Hügelland", "Холмы", "Tepeler", "Perbukitan"],
  "Sunset Bridges": ["Puentes del Ocaso", "Pontes do Pôr do Sol", "Ponts du Couchant", "Abendbrücken", "Мосты заката", "Gün Batımı Köprüleri", "Jembatan Senja"],
  "Desert Ruins": ["Ruinas del Desierto", "Ruínas do Deserto", "Ruines du Désert", "Wüstenruinen", "Руины пустыни", "Çöl Harabeleri", "Reruntuhan Gurun"],
  "Snowy Pass": ["Paso Nevado", "Passo Nevado", "Col Enneigé", "Schneepass", "Снежный перевал", "Karlı Geçit", "Celah Bersalju"],
  "Starry Tunnels": ["Túneles Estrellados", "Túneis Estrelados", "Tunnels Étoilés", "Sternentunnel", "Звёздные туннели", "Yıldızlı Tüneller", "Terowongan Berbintang"],
  "Haunted Hollow": ["Hondonada Embrujada", "Vale Assombrado", "Creux Hanté", "Spukmulde", "Проклятая лощина", "Perili Vadi", "Lembah Berhantu"],
  "Pumpkin Patch": ["Huerto de Calabazas", "Plantação de Abóboras", "Champ de Citrouilles", "Kürbisfeld", "Тыквенное поле", "Balkabağı Tarlası", "Kebun Labu"],
  "water": ["agua", "água", "eau", "Wasser", "вода", "su", "air"],
  "lava": ["lava", "lava", "lave", "Lava", "лава", "lav", "lava"],
  "toxic goo": ["baba tóxica", "gosma tóxica", "glu toxique", "Giftschleim", "ядовитая слизь", "zehirli balçık", "lendir beracun"],
  "icy water": ["agua helada", "água gelada", "eau glacée", "Eiswasser", "ледяная вода", "buzlu su", "air es"],
  "quicksand": ["arenas movedizas", "areia movediça", "sables mouvants", "Treibsand", "зыбучий песок", "bataklık kum", "pasir hisap"],
};

const STORE = 'tdk_lang';
let lang = 'en';
let idx = -1;

/** save = the player picked it (remembered); otherwise it was detected. */
export function setLang(code, save = false) {
  const i = LANGS.findIndex((l) => l.code === code);
  lang = i >= 0 ? code : 'en';
  idx = i - 1; // English has no column
  if (save) kv.set(STORE, lang);
  try { document.documentElement.lang = lang; } catch (e) {}
}
export const getLang = () => lang;

/** Saved choice → portal SDK language → browser language → English. */
export function detectLang() {
  let saved = null;
  saved = kv.get(STORE);
  const sdk = (() => {
    try { return window.bridge?.platform?.language || window.CrazyGames?.SDK?.user?.systemInfo?.locale || null; } catch (e) { return null; }
  })();
  for (const c of [saved, sdk, ...(navigator.languages || [navigator.language])]) {
    const code = String(c || '').slice(0, 2).toLowerCase();
    if (LANGS.some((l) => l.code === code)) return setLang(code);
  }
  setLang('en');
}

export function t(key, vars) {
  let s = key;
  if (idx >= 0) { const row = D[key]; if (row && row[idx]) s = row[idx]; }
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  return s;
}
