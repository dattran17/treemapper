import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import SingleTreeImage from 'assets/images/svg/PlaceholderAvatar.svg'
import { Colors, Typography } from 'src/utils/constants'
import { scaleFont } from 'src/utils/constants/mixins'
import { Skeleton } from 'moti/skeleton'
import ProfileEditIcon from 'assets/images/svg/ProfileEdit.svg'
import openWebView from 'src/utils/helpers/appHelper/openWebView'


const SidebarHeader = () => {
  const { image, displayName, email } = useSelector(
    (state: RootState) => state.userState,
  )
  const webAuthLoading = useSelector(
    (state: RootState) => state.tempState.webAuthLoading,
  )
  const avatar = `https://${process.env.EXPO_PUBLIC_CDN_URL}/media/cache/profile/avatar/${image}`
  const editHandler = () => {
    openWebView(`https://${process.env.EXPO_PUBLIC_WEBAPP_URL}/login`);

  }
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Skeleton show={webAuthLoading} colorMode="light" radius={12}>
          {image ? (
            <Image source={{ uri: avatar }} style={styles.imageWrapper} />
          ) : (
            <SingleTreeImage style={styles.imageWrapper} />
          )}
        </Skeleton>
      </View>
      <View style={styles.loaderView}>
        <Skeleton show={webAuthLoading} colorMode="light" radius={12}>
          <Text style={styles.userName}>
            {displayName ? `${displayName}` : 'Guest User'}
          </Text>
        </Skeleton>
        {!!email && <Skeleton show={webAuthLoading} colorMode="light" radius={12}>
          <Text style={styles.emailLabel}>
            {email}
          </Text>
        </Skeleton>}
      </View>
      {!!email && <TouchableOpacity style={styles.editMe} onPress={editHandler}>
        <ProfileEditIcon />
      </TouchableOpacity>}
    </View>
  )
}

export default SidebarHeader

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    marginLeft: 20,
    borderRadius: 10,
  },
  userName: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: scaleFont(18),
    color: Colors.DARK_TEXT_COLOR
  },
  emailLabel: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: scaleFont(14),
    color: Colors.TEXT_COLOR
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  loaderView: {
    justifyContent: "center",
    height: '100%',
    paddingHorizontal: 10,
    width: '70%'
  },
  editMe: {
    width: 35,
    height: 35,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: '5%',
    backgroundColor: Colors.NEW_PRIMARY + '1A'
  }
})
