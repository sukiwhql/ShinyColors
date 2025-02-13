import getProfile from '../../store/profile'
import { getIdolName } from '../../store/name'
import { router } from '../request'
import { getModule } from '../get-module'
import tagText from '../../utils/tagText'
import { sleep } from '../../utils/index'

const transProfileKey = (list, labelMap) => {
  for (let [key, name] of labelMap) {
    const data = list.find(item => item.name === key)
    if (data?.children) {
      const profileKeyObj = data.children.find(obj => obj.name === 'title' || obj.name === `${key}Title`)
      if (profileKeyObj) {
        profileKeyObj.text = name
      }
    }
  }
}

const transProfileKeys = (type) => {
  let profileKeyTransed = false
  return async () => {
    if (profileKeyTransed) return
    profileKeyTransed = true
    const profileMap = await getProfile()
    const labelMap = profileMap.get('label')
    await sleep(1000)
    const list = await getModule(type)
    transProfileKey(list, labelMap)
  }
}

const profileKey1 = transProfileKeys('PROFILE_KEY')

const transName = async (data) => {
  const idolName = await getIdolName()
  if (idolName.has(data.name)) {
    data.name = tagText(idolName.get(data.name))
  }
  if (idolName.has(data.firstName)) {
    data.firstName = idolName.get(data.firstName)
  }
}

const transProfile = async (data) => {
  const profileMap = await getProfile()
  await transName(data)
  const textData = profileMap.get(data.id)
  for (let key in textData) {
    if (key !== 'id' && data[key]) {
      if (key === 'unit') {
        data.unit.name = textData[key]
      } else {
        data[key] = textData[key]
      }
    }
  }
}

const albumProfile = async (data) => {
  await transProfile(data)
  profileKey1()
}

const idolProfile = async (data) => {
  const chara = data.idol.character
  await transProfile(chara)
}

const sIdolProfile = async (data) => {
  const chara = data.supportIdol.character
  await transProfile(chara)
}

const fesIdolProfile = async (data) => {
  const chara = data.userFesIdol.idol.character
  await transProfile(chara)
}

router.post('characterAlbums/characters/{num}', albumProfile)
router.get('userIdols/{num}', idolProfile)
router.get('userSupportIdols/{num}', sIdolProfile)
router.get('userFesIdols/{num}', fesIdolProfile)