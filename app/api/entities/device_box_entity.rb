# frozen_string_literal: true

module Entities
  class DeviceBoxEntity < ApplicationEntity
    expose(
      :id,
      :name,
      :children,
      :children_count,
    )

    private

    def children
      depth = options[:root_container] ? 1 : 2
      serialize_children(object.hash_tree(limit_depth: depth)[object])
    end

    def serialize_children(container_tree_hash) # rubocop:disable Metrics/MethodLength
      container_tree_hash.map do |container, subcontainers|
        current_attachments = all_descendants_attachments.select { |att| att.attachable_id == container.id }

        {
          id: container.id,
          name: container.name,
          container_type: container.container_type,
          attachments: current_attachments,
          created_at: container.created_at,
          children: serialize_children(subcontainers).compact,
        }
      end
    end

    def children_count
      object.children.count
    end

    def all_descendants_attachments
      @all_descendants_attachments ||= Attachment.where_container(object.descendant_ids).limit(100)
    end
  end
end
