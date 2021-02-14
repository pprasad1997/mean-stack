import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { map } from "rxjs/operators"

import { environment } from "../../environments/environment";
import { Post } from "./posts.model";

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({providedIn: 'root'})
export class PostsService {

  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(pageSize: number, currentPage: number){
    const queryParams = `?pagesize=${pageSize}&currentpage=${currentPage}`;
    this.http.get<{message: string, posts:any, maxPosts: number}>(BACKEND_URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          maxPosts: postData.maxPosts
        };
      }))
      .subscribe((tranformedPostData) => {
        this.posts = tranformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: tranformedPostData.maxPosts
        });
      });
  }

  getPostsUpdatedListener(){
    return this.postsUpdated.asObservable();
  }

  getPost(id: string){
    // return {...this.posts.find(p => p.id === id)};
    return this.http.get<{_id: string, title: string, content: string, imagePath: string}>(
      BACKEND_URL + id
    );
  }

  addPost(title: string, content: string, image: File){
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    this.http.post<{message: string, post: Post}>(BACKEND_URL, postData)
      .subscribe(response => {
        this.router.navigate(['']);
      }, () => {
        this.router.navigate(['']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string){
    let postData: FormData | Post;
    if(typeof(image) === 'object'){
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      }
    }
    this.http
      .put(BACKEND_URL + id, postData)
      .subscribe(() => {
        this.router.navigate(['']);
      }, () => {
        this.router.navigate(['']);
      });
  }

  deletePost(postId:string){
    return this.http.delete(BACKEND_URL + postId);
  }


}
