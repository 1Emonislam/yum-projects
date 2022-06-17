import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import ClientsIcon from '@icons/ClientsIcon'

// import BackIcon from '@icons/BackIcon'
// import CloseIcon from '@icons/CloseIcon'
import GroupIcon from '@icons/GroupIcon'
import SearchIcon from '@icons/SearchIcon'
import SignOutIcon from '@icons/SignOutIcon'

const settings = {
  icon: props => {
    const { name } = props
    const Component =
      {
        clients: ClientsIcon,
        group: GroupIcon,
        search: SearchIcon,
        arrow: MaterialIcons,
        close: MaterialIcons,
        signout: SignOutIcon,
        // back: BackIcon,
        // close: CloseIcon,
      }[name] || MaterialIcons

    return <Component {...props} />
  },
}

export default settings
