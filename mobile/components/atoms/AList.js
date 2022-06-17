import React, { useCallback } from 'react'
import { FlatList, View, RefreshControl } from 'react-native'
import { Divider, Text } from 'react-native-paper'
import AActivityIndicator from './AActivityIndicator'

const ListEmptyComponent = ({ emptyStateText = 'No data' }) => {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingBottom: 8,
      }}
    >
      <Text style={{ fontSize: 16 }}>{emptyStateText}</Text>
    </View>
  )
}

const Loading = () => {
  return (
    <View style={{ padding: 16 }}>
      <AActivityIndicator />
    </View>
  )
}

export const AList = ({
  emptyStateText,
  emptyStateComponent,
  isFetching,
  renderItem,
  noFlatList = false,
  data = [],
  ...props
}) => {
  const keyExtractor = useCallback((item, index) => {
    if (!item._id) {
      return `item-${index}`
    }

    return `item-${item._id}`
  }, [])

  if (noFlatList) {
    if (isFetching) {
      return <Loading />
    }

    if (Array.isArray(data) && data.length === 0) {
      if (emptyStateComponent) {
        return emptyStateComponent
      } else {
        return <ListEmptyComponent emptyStateText={emptyStateText} />
      }
    }

    return <View>{data.map((item, index) => renderItem({ item, index }))}</View>
  }

  return (
    <FlatList
      data={data || []}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={Divider}
      refreshing={isFetching}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={isFetching} />}
      ListEmptyComponent={
        !isFetching &&
        (emptyStateComponent ? (
          emptyStateComponent
        ) : (
          <ListEmptyComponent emptyStateText={emptyStateText} />
        ))
      }
      ItemSeparatorComponent={false}
      contentContainerStyle={{ flexGrow: 1 }}
      {...props}
    />
  )
}

export default AList
