import React, {useRef, useCallback, useEffect} from 'react';
import {
  ScrollView,
  View,
  FlatListProps,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

// Complete replacement for FlatList to avoid React Native 0.72.7 bugs
// This uses ScrollView instead of FlatList to bypass the props.getItem error
export class SafeFlatList<T = any> extends React.Component<FlatListProps<T>> {
  scrollViewRef = React.createRef<ScrollView>();

  scrollToEnd = (params?: {animated?: boolean}) => {
    this.scrollViewRef.current?.scrollToEnd(params);
  };

  scrollToOffset = (params: {animated?: boolean; offset: number}) => {
    this.scrollViewRef.current?.scrollTo({
      y: params.offset,
      animated: params.animated,
    });
  };

  render() {
    const {
      data = [],
      renderItem,
      keyExtractor,
      contentContainerStyle,
      showsVerticalScrollIndicator = true,
      showsHorizontalScrollIndicator = true,
      refreshControl,
      onContentSizeChange,
      scrollEnabled = true,
      horizontal = false,
      inverted = false,
      ItemSeparatorComponent,
      ListEmptyComponent,
      ListFooterComponent,
      ListHeaderComponent,
      onScroll,
      style,
      refreshing,
      onRefresh,
      ...restProps
    } = this.props;

    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];

    // Default key extractor
    const getKey = keyExtractor || ((item: any, index: number) => String(index));

    // Render all items
    const items = safeData.map((item, index) => {
      const element = renderItem ? renderItem({item, index, separators: {
        highlight: () => {},
        unhighlight: () => {},
        updateProps: () => {},
      }}) : null;

      const key = getKey(item, index);

      return (
        <React.Fragment key={key}>
          {element}
          {ItemSeparatorComponent && index < safeData.length - 1 && (
            <ItemSeparatorComponent />
          )}
        </React.Fragment>
      );
    });

    // Handle inverted list
    const content = inverted ? items.reverse() : items;

    return (
      <ScrollView
        ref={this.scrollViewRef}
        style={style}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || false}
              onRefresh={onRefresh}
              {...(refreshControl as any)}
            />
          ) : refreshControl
        }
        onContentSizeChange={onContentSizeChange}
        scrollEnabled={scrollEnabled}
        horizontal={horizontal}
        onScroll={onScroll}
        {...restProps}
      >
        {ListHeaderComponent && <ListHeaderComponent />}
        {safeData.length === 0 && ListEmptyComponent ? (
          <ListEmptyComponent />
        ) : (
          content
        )}
        {ListFooterComponent && <ListFooterComponent />}
      </ScrollView>
    );
  }
}

// Export as default for compatibility
export default SafeFlatList;