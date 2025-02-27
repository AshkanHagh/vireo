import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const UserRole = pgEnum("role", ["user", "admin", "manager"]);
export const UserTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    role: UserRole("role").default("user"),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      emailIndex: uniqueIndex("emailIndex").on(table.email),
      usernameIndex: uniqueIndex("usernameIndex").on(table.username),
    };
  },
);

export const UserGender = pgEnum("gender", ["male", "female"]);
export const UserProfileTable = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    fullName: varchar("fullName", { length: 255 }),
    bio: varchar("bio", { length: 255 }),
    profilePic: text("profilePic"),
    gender: UserGender("gender"),
    isBan: boolean("isBan").default(false),
  },
  (table) => {
    return { userIndex: index("userIndex_userTable").on(table.userId) };
  },
);

export const FollowersTable = pgTable(
  "followers",
  {
    followerId: uuid("followerId")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    followedId: uuid("followedId")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.followerId, table.followedId] }),
    };
  },
);

export const PostTable = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    text: text("text").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return { userIndex: index("userIndex_postTable").on(table.userId) };
  },
);

export const CommentTable = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("authorId")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      authorIndex: index("authorIndex_commentTable").on(table.authorId),
    };
  },
);

export const RepliesTable = pgTable(
  "replies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commentId: uuid("commentId")
      .references(() => CommentTable.id, { onDelete: "cascade" })
      .notNull(),
    authorId: uuid("authorId")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      commentIndex: index("commentIndex_repliesTable").on(table.commentId),
      authorIndex: index("authorIndex_repliesTable").on(table.authorId),
    };
  },
);

export const PostCommentTable = pgTable(
  "post_comments",
  {
    commentId: uuid("commentId")
      .references(() => CommentTable.id, { onDelete: "cascade" })
      .notNull(),
    postId: uuid("postId")
      .references(() => PostTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return { pk: primaryKey({ columns: [table.postId, table.commentId] }) };
  },
);

export const PostLikeTable = pgTable(
  "post_likes",
  {
    userId: uuid("userId")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    postId: uuid("postId")
      .references(() => PostTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return { pk: primaryKey({ columns: [table.postId, table.userId] }) };
  },
);

export const PostTagTable = pgTable(
  "post_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("postId").references(() => PostTable.id, {
      onDelete: "cascade",
    }),
    tag: varchar("tag", { length: 255 }).notNull(),
  },
  (table) => {
    return { postIdIndex: index("postIdIndex").on(table.postId) };
  },
);

export const NotificationType = pgEnum("type", ["like", "follow"]);
export const NotificationTable = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    from: uuid("from")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    to: uuid("to")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    type: NotificationType("type"),
    read: boolean("read").default(false),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return { fromIndex: index("fromIndex_notificationTable").on(table.from) };
  },
);

export const SavePostTable = pgTable(
  "save_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("postId")
      .references(() => PostTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("userId")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return {
      postIndex: index("postIndex_saveTable").on(table.postId),
      userIndex: index("userIndex_saveTable").on(table.userId),
    };
  },
);

export const UserTableRelations = relations(UserTable, ({ one, many }) => {
  return {
    profile: one(UserProfileTable),
    followings: many(FollowersTable, { relationName: "followings" }),
    followers: many(FollowersTable, { relationName: "followers" }),
    // followings : one(FollowersTable, {
    //     fields : [UserTable.id], references : [FollowersTable.followerId], relationName : 'followings'
    // }),
    // followers : one(FollowersTable, {
    //     fields : [UserTable.id], references : [FollowersTable.followedId], relationName : 'followers'
    // }),
    posts: many(PostTable),
    comments: many(CommentTable),
    replies: many(RepliesTable),
    likes: many(PostLikeTable),
    notificationFrom: one(NotificationTable, {
      fields: [UserTable.id],
      references: [NotificationTable.from],
      relationName: "from_user",
    }),
    notifications: one(NotificationTable, {
      fields: [UserTable.id],
      references: [NotificationTable.to],
      relationName: "to_user",
    }),
  };
});

export const UserProfileTableRelations = relations(
  UserProfileTable,
  ({ one }) => {
    return {
      user: one(UserTable, {
        fields: [UserProfileTable.userId],
        references: [UserTable.id],
        relationName: "userProfile",
      }),
    };
  },
);

export const FollowersTableRelations = relations(FollowersTable, ({ one }) => {
  return {
    followed: one(UserTable, {
      fields: [FollowersTable.followerId],
      references: [UserTable.id],
      relationName: "followings",
    }),
    follower: one(UserTable, {
      fields: [FollowersTable.followedId],
      references: [UserTable.id],
      relationName: "followers",
    }),
  };
});

export const PostTableRelations = relations(PostTable, ({ one, many }) => {
  return {
    user: one(UserTable, {
      fields: [PostTable.userId],
      references: [UserTable.id],
      relationName: "user_post",
    }),
    comments: many(PostCommentTable),
    likes: many(PostLikeTable),
    tags: many(PostTagTable, { relationName: "Post_tag" }),
  };
});

export const CommentTableRelations = relations(
  CommentTable,
  ({ one, many }) => {
    return {
      author: one(UserTable, {
        fields: [CommentTable.authorId],
        references: [UserTable.id],
        relationName: "comment_author",
      }),
      replies: many(RepliesTable),
      post: many(PostCommentTable),
    };
  },
);

export const RepliesTableRelations = relations(RepliesTable, ({ one }) => {
  return {
    comment: one(CommentTable, {
      fields: [RepliesTable.commentId],
      references: [CommentTable.id],
    }),
    author: one(UserTable, {
      fields: [RepliesTable.authorId],
      references: [UserTable.id],
      relationName: "replies_author",
    }),
  };
});

export const PostCommentTableRelations = relations(
  PostCommentTable,
  ({ one }) => {
    return {
      comment: one(CommentTable, {
        fields: [PostCommentTable.commentId],
        references: [CommentTable.id],
      }),
      post: one(PostTable, {
        fields: [PostCommentTable.postId],
        references: [PostTable.id],
      }),
    };
  },
);

export const PostLikeTableRelations = relations(PostLikeTable, ({ one }) => {
  return {
    user: one(UserTable, {
      fields: [PostLikeTable.userId],
      references: [UserTable.id],
      relationName: "like_userId",
    }),
    post: one(PostTable, {
      fields: [PostLikeTable.postId],
      references: [PostTable.id],
      relationName: "like_postId",
    }),
  };
});

export const NotificationTableRelations = relations(
  NotificationTable,
  ({ one }) => {
    return {
      from: one(UserTable, {
        fields: [NotificationTable.from],
        references: [UserTable.id],
        relationName: "from_notification",
      }),
      to: one(UserTable, {
        fields: [NotificationTable.to],
        references: [UserTable.id],
        relationName: "to_notification",
      }),
    };
  },
);

export const SavePostTableRelations = relations(SavePostTable, ({ one }) => {
  return {
    user: one(UserTable, {
      fields: [SavePostTable.userId],
      references: [UserTable.id],
      relationName: "save_userId",
    }),
    post: one(PostTable, {
      fields: [SavePostTable.postId],
      references: [PostTable.id],
      relationName: "save_postId",
    }),
  };
});

export const PostTagTableRelations = relations(PostTagTable, ({ one }) => {
  return {
    post: one(PostTable, {
      fields: [PostTagTable.postId],
      references: [PostTable.id],
      relationName: "Post_tag",
    }),
  };
});
